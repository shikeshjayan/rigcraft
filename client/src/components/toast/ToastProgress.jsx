const ToastProgress = ({ progress, color }) => (
  <div className="absolute bottom-0 left-0 h-0.5 w-full" style={{ overflow: "hidden" }}>
    <div
      className="h-full"
      style={{
        width: `${Math.max(0, Math.min(100, progress))}%`,
        backgroundColor: color,
        transition: "width 100ms linear",
      }}
    />
  </div>
);

export default ToastProgress;