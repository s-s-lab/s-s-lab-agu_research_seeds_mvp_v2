import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { siteConfig } from "./config/site";
import { Layout } from "./components/Layout";
import { allSeeds, dataIssues } from "./utils/seedLoader";
import { canonicalForHash, parseHashRoute, type AppRoute } from "./utils/routes";
import { HomePage } from "./pages/HomePage";
import { SeedsPage } from "./pages/SeedsPage";
import { SeedDetailPage } from "./pages/SeedDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { DataEditorPage } from "./pages/DataEditorPage";
import type { ResearchSeed } from "./types/researchSeed";

const routeTitle = (route: AppRoute, seed?: ResearchSeed): string => {
  if (route.name === "seedDetail" && seed) {
    return `${seed.title} | ${siteConfig.siteName}`;
  }

  const titles: Record<AppRoute["name"], string> = {
    home: siteConfig.siteName,
    seeds: `研究シーズ一覧 | ${siteConfig.siteName}`,
    seedDetail: `研究シーズ詳細 | ${siteConfig.siteName}`,
    about: `研究シーズについて | ${siteConfig.siteName}`,
    contact: `問い合わせ | ${siteConfig.siteName}`,
    dataEditor: `データ編集支援 | ${siteConfig.siteName}`,
    notFound: `ページが見つかりません | ${siteConfig.siteName}`,
  };

  return titles[route.name];
};

const routeDescription = (route: AppRoute, seed?: ResearchSeed): string => {
  if (route.name === "seedDetail" && seed) {
    return seed.summary;
  }

  if (route.name === "seeds") {
    return "研究分野、キーワード、SDGs、連携希望内容などから研究シーズを検索できます。";
  }

  return "青山学院大学の研究シーズを検索・絞り込み・閲覧できるGitHub Pages向けMVPです。";
};

const useHashRoute = () => {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseHashRoute(window.location.hash),
  );

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
};

const DataIssueBanner = () => {
  if (dataIssues.length === 0) {
    return null;
  }

  return (
    <section className="data-issue-banner" aria-label="データ検証エラー">
      <AlertTriangle aria-hidden="true" />
      <div>
        <strong>一部の研究シーズJSONに確認が必要な項目があります。</strong>
        <p>公開画面では検証を通過したデータのみ表示しています。</p>
        <ul>
          {dataIssues.slice(0, 4).map((issue) => (
            <li key={`${issue.fileName}-${issue.field}-${issue.message}`}>
              {issue.fileName} / {issue.field}: {issue.message}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default function App() {
  const route = useHashRoute();
  const selectedSeed = useMemo(() => {
    if (route.name !== "seedDetail") {
      return undefined;
    }
    return allSeeds.find((seed) => seed.id === route.seedId);
  }, [route]);

  useEffect(() => {
    document.title = routeTitle(route, selectedSeed);

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    description?.setAttribute("content", routeDescription(route, selectedSeed));

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute(
      "href",
      canonicalForHash(siteConfig.canonicalBaseUrl, window.location.hash || "#/"),
    );
  }, [route, selectedSeed]);

  const content = (() => {
    switch (route.name) {
      case "home":
        return <HomePage seeds={allSeeds} />;
      case "seeds":
        return <SeedsPage seeds={allSeeds} params={route.params} />;
      case "seedDetail":
        return <SeedDetailPage seed={selectedSeed} seeds={allSeeds} />;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage seeds={allSeeds} params={route.params} />;
      case "dataEditor":
        return <DataEditorPage seeds={allSeeds} />;
      case "notFound":
        return (
          <section className="section narrow">
            <h1>ページが見つかりません</h1>
            <p>URLを確認するか、研究シーズ一覧から目的の情報を探してください。</p>
            <a className="button primary" href="#/seeds">
              研究シーズ一覧へ
            </a>
          </section>
        );
      default:
        return null;
    }
  })();

  return (
    <Layout activeRoute={route.name}>
      <DataIssueBanner />
      {content}
    </Layout>
  );
}
