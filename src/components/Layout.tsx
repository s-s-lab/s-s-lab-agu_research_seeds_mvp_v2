import {
  BookOpen,
  Database,
  Mail,
  PenTool,
  Search,
  University,
} from "lucide-react";
import { siteConfig } from "../config/site";
import type { AppRoute } from "../utils/routes";

type LayoutProps = {
  activeRoute: AppRoute["name"];
  children: React.ReactNode;
};

const navItems = [
  { href: "#/", label: "トップ", route: "home", icon: University },
  { href: "#/seeds", label: "研究シーズ一覧", route: "seeds", icon: Search },
  { href: "#/about", label: "研究シーズとは", route: "about", icon: BookOpen },
  { href: "#/contact", label: "問い合わせ", route: "contact", icon: Mail },
  {
    href: "#/data-editor",
    label: "データ編集支援",
    route: "dataEditor",
    icon: PenTool,
  },
] as const;

export const Layout = ({ activeRoute, children }: LayoutProps) => (
  <div className="app-shell">
    <header className="site-header">
      <a className="brand" href="#/" aria-label={`${siteConfig.siteName} トップへ`}>
        <span className="brand-mark" aria-hidden="true">
          <Database size={22} />
        </span>
        <span>
          <span className="brand-main">{siteConfig.shortName}</span>
          <span className="brand-sub">Aoyama Gakuin University MVP</span>
        </span>
      </a>
      <nav className="site-nav" aria-label="主要ナビゲーション">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            activeRoute === item.route ||
            (item.route === "seeds" && activeRoute === "seedDetail");
          return (
            <a
              key={item.href}
              href={item.href}
              className={active ? "active" : undefined}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </header>
    <main>{children}</main>
    <footer className="site-footer">
      <div>
        <strong>{siteConfig.siteName}</strong>
        <p>GitHub PagesとJSONファイルで運用する、研究シーズ公開サイトのMVPです。</p>
      </div>
      <div className="footer-links">
        <a href="#/data-editor">データ編集支援</a>
        <a href="#/contact">問い合わせ</a>
      </div>
    </footer>
  </div>
);
