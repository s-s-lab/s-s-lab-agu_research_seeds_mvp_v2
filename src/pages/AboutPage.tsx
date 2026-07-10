import { ArrowDown, Handshake, Search, Sprout, University } from "lucide-react";

const flow = [
  { icon: University, title: "大学の研究成果・技術・知見" },
  { icon: Sprout, title: "研究シーズとして分かりやすく公開" },
  { icon: Search, title: "企業・自治体・研究機関等が検索" },
  { icon: Handshake, title: "共同研究・技術相談・社会実装につながる" },
];

export const AboutPage = () => (
  <section className="section narrow">
    <p className="eyebrow">About</p>
    <h1>研究シーズとは</h1>
    <p className="lead">
      研究シーズとは、大学の研究者が持つ研究成果、技術、データ、専門知識、方法論などを、学外の人にも探しやすい形で整理した情報です。
    </p>
    <p>
      まだ製品やサービスになっていない段階でも、企業や自治体の課題と結びつくことで、共同研究、実証実験、技術相談、人材育成、社会実装につながる可能性があります。
    </p>

    <div className="flow-list" aria-label="研究シーズ公開から連携までの流れ">
      {flow.map((item, index) => {
        const Icon = item.icon;
        return (
          <div className="flow-item" key={item.title}>
            <div>
              <Icon size={24} aria-hidden="true" />
              <strong>{item.title}</strong>
            </div>
            {index < flow.length - 1 ? <ArrowDown size={22} aria-hidden="true" /> : null}
          </div>
        );
      })}
    </div>

    <div className="plain-panel">
      <h2>MVPで確認すること</h2>
      <p>
        本サイトでは、JSONファイルで研究シーズを管理し、公開ページで検索・絞り込み・詳細閲覧ができるかを検証します。運用担当者はGitHub上でデータを更新し、GitHub Actionsで検証と公開を行います。
      </p>
    </div>
  </section>
);
