import os
import json
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

# 1. Setup & Authentication
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# 2. Smart Pathing to load your target stack
script_dir = os.path.dirname(os.path.abspath(__file__))
possible_paths = [
    os.path.join(script_dir, '..', 'src', 'recon-config.json'),
    os.path.join(script_dir, '..', 'recon-config.json'),
    os.path.join(script_dir, 'recon-config.json')
]

config_file = next((p for p in possible_paths if os.path.exists(p)), None)

if not config_file:
    print("\n[!] FATAL: Cannot find recon-config.json.")
    print("[!] -> Windows might have secretly saved it as 'recon-config.json.txt'.")
    print("[!] -> Please check your File Explorer, ensure 'File name extensions' is checked in the View tab, and verify the exact name.")
    exit(1)

print(f"[*] Successfully found config at: {config_file}")
with open(config_file, 'r') as f:
    config = json.load(f)
    TARGET_KEYWORDS = [k.lower() for k in config.get('target_keywords', [])]
    EXCLUSION_KEYWORDS = [k.lower() for k in config.get('exclusion_keywords', [])]

# 3. The Scraping Engine
async def scrape_target(page, target):
    print(f"[*] Recon initiated for: {target['company_name']}")
    try:
        await page.goto(target['base_url'], wait_until="networkidle", timeout=30000)
        
        # Extract the fully rendered HTML
        html = await page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        found_jobs = []
        
        # Heuristic: Find all anchor tags (links) on the page
        for a_tag in soup.find_all('a', href=True):
            title = a_tag.get_text(strip=True).lower()
            href = a_tag['href']
            
            # Skip empty links
            if not title or len(title) < 5:
                continue
                
            # Check for exclusions first (e.g., "Senior", "Manager")
            if any(ex_word in title for ex_word in EXCLUSION_KEYWORDS):
                continue
                
            # Check for matches against your tech stack
            matched_skills = [kw for kw in TARGET_KEYWORDS if kw in title]
            
            if matched_skills:
                # Format the full URL if it's a relative link
                full_url = href if href.startswith('http') else f"{target['base_url'].rstrip('/')}/{href.lstrip('/')}"
                
                job_data = {
                    "title": title.title(),
                    "company_id": target['id'],
                    "tech_stack_string": ", ".join(matched_skills).title(),
                    "relevance_score": len(matched_skills) * 10,
                    "posting_url": full_url
                }
                found_jobs.append(job_data)
        
        return found_jobs

    except Exception as e:
        print(f"[!] Error scraping {target['company_name']}: {str(e)}")
        return []

# 4. Main Execution Loop
async def main():
    print("--- ReconBoard Scraper Initializing ---")
    
    # Fetch target URLs from Supabase
    response = supabase.table("target_urls").select("*").execute()
    targets = response.data
    
    if not targets:
        print("[!] No target URLs found in the database. Aborting.")
        return

    all_found_jobs = []

    # Spin up the headless browser
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()

        for target in targets:
            jobs = await scrape_target(page, target)
            all_found_jobs.extend(jobs)
            
            # Update the last_scraped_at timestamp
            supabase.table("target_urls").update({"last_scraped_at": "now()"}).eq("id", target['id']).execute()

        await browser.close()

    # Push results to Database
    if all_found_jobs:
        print(f"[*] Uploading {len(all_found_jobs)} potential matches to HQ...")
        for job in all_found_jobs:
            try:
                # Insert if the posting_url doesn't already exist (handled by DB UNIQUE constraint)
                supabase.table("job_postings").insert(job).execute()
                print(f"    -> Added: {job['title']}")
            except Exception as e:
                # Usually triggers if the job is already in the database
                pass
    else:
        print("[-] No new matches found today.")
        
    print("--- Recon Complete ---")

if __name__ == "__main__":
    asyncio.run(main())