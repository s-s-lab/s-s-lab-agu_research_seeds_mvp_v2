import { FormEvent } from "react";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

const examples = [
  "食品工場の廃熱を活用してエネルギーコストを削減したい",
  "地域の高齢者の転倒リスクをデータから早期に把握したい",
  "生成AIを社員教育や人材育成に活用したい",
];

type AIConsultFormProps = {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export const AIConsultForm = ({
  value,
  isLoading,
  onChange,
  onSubmit,
}: AIConsultFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="ai-consult-form" onSubmit={handleSubmit}>
      <label htmlFor="ai-consult-challenge">
        <span>御社・組織の課題を入力してください</span>
        <textarea
          id="ai-consult-challenge"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="例：食品工場で発生する廃熱を有効活用し、エネルギーコストとCO2排出量を削減したい。"
          minLength={20}
          maxLength={2000}
          rows={7}
          required
          disabled={isLoading}
        />
      </label>

      <div className="ai-consult-form-meta">
        <span>{value.length.toLocaleString()} / 2,000文字</span>
        <span>20文字以上で入力してください</span>
      </div>

      <div className="ai-consult-examples" aria-label="相談例">
        <strong>相談例</strong>
        <div>
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onChange(example)}
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-consult-caution">
        <AlertTriangle size={18} aria-hidden="true" />
        <p>
          AIが公開中の研究シーズをもとに関連研究や活用アイデアを提示します。研究成果による課題解決を保証するものではありません。機密情報、営業秘密、個人情報等は入力しないでください。
        </p>
      </div>

      <button
        className="button primary ai-consult-submit"
        type="submit"
        disabled={isLoading || value.trim().length < 20}
      >
        <Sparkles size={18} aria-hidden="true" />
        {isLoading ? "研究シーズを探しています" : "AIに相談する"}
        {!isLoading && <ArrowRight size={17} aria-hidden="true" />}
      </button>
    </form>
  );
};
