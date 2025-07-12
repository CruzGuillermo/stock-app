import './BubbleBackground.css';

export default function BubbleBackground() {
  return (
    <div className="bubble-background">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="bubble"></div>
      ))}
    </div>
  );
}
