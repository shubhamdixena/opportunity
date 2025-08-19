import SimpleScraper from '@/components/simple-scraper';

export default function ScrapingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Opportunity Scraper</h1>
        <p className="text-muted-foreground">
          Scrape opportunities from various sources using smart content extraction
        </p>
      </div>
      <SimpleScraper />
    </div>
  );
}
