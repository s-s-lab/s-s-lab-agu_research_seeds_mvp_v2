import { useMemo, useState } from "react";
import { Check, Clipboard, Mail } from "lucide-react";
import { siteConfig } from "../config/site";
import type { ResearchSeed } from "../types/researchSeed";
import { buildMailto } from "../utils/links";
import { getPublishedSeeds } from "../utils/seedFilters";

type ContactPageProps = {
  seeds: ResearchSeed[];
  params: URLSearchParams;
};

export const ContactPage = ({ seeds, params }: ContactPageProps) => {
  const [copied, setCopied] = useState(false);
  const seed = useMemo(() => {
    const seedId = params.get("seed");
    return getPublishedSeeds(seeds).find((item) => item.id === seedId);
  }, [params, seeds]);

  const subject = seed
    ? `【研究シーズ問い合わせ】${seed.title}`
    : "【研究シーズ問い合わせ】";
  const mailto = buildMailto(siteConfig.contact.email, subject, [
    "以下の項目を分かる範囲でご記入ください。",
    "",
    `研究シーズ名: ${seed?.title ?? ""}`,
    "お問い合わせ内容:",
    "所属機関・部署:",
    "お名前:",
    "連絡先:",
  ]);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(siteConfig.contact.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="section narrow">
      <p className="eyebrow">Contact</p>
      <h1>問い合わせ</h1>
      <p className="lead">
        外部フォームは使用せず、設定ファイルで指定したメールアドレスへ問い合わせる形にしています。
      </p>

      {seed ? (
        <div className="selected-seed-box">
          <span>問い合わせ対象</span>
          <strong>{seed.title}</strong>
        </div>
      ) : null}

      <div className="contact-actions">
        <a className="button primary" href={mailto}>
          <Mail size={17} aria-hidden="true" />
          メールソフトを開く
        </a>
        <button className="button secondary" type="button" onClick={copyEmail}>
          {copied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
          {copied ? "コピーしました" : "メールアドレスをコピー"}
        </button>
      </div>

      <dl className="contact-info">
        <div>
          <dt>問い合わせ先</dt>
          <dd>{siteConfig.contact.label}</dd>
        </div>
        <div>
          <dt>メールアドレス</dt>
          <dd>{siteConfig.contact.email}</dd>
        </div>
      </dl>

      <div className="plain-panel">
        <h2>問い合わせ時に伝えてほしい項目</h2>
        <ul className="check-list">
          <li>関心のある研究シーズ名</li>
          <li>相談したい内容、想定している課題や用途</li>
          <li>所属機関、部署、お名前、連絡先</li>
          <li>希望する連携形態や時期</li>
          <li>公開できない情報が含まれる場合は、その旨</li>
        </ul>
      </div>
    </section>
  );
};
