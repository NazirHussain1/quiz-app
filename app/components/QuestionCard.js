"use client";

export default function QuestionCard({ question, options, selected, setSelected }) {
  return (
    <div className="card">
      <h3 dangerouslySetInnerHTML={{ __html: question }}></h3>

      {options.map((opt) => (
        <div key={opt} style={{ marginTop: 10 }}>
          <label>
            <input
              type="radio"
              name="option"
              value={opt}
              checked={selected === opt}
              onChange={(e) => setSelected(e.target.value)}
            />
            <span
              dangerouslySetInnerHTML={{ __html: opt }}
              style={{ marginLeft: 10 }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
