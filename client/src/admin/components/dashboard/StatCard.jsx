const StatCard = ({ title, value, icon: Icon, change, changeColor, subtitle }) => {
  const showChange = change || subtitle;

  return (
    <div
      className="relative flex flex-col overflow-hidden group transition-all duration-300 hover:scale-[1.02] cursor-default"
      style={{
        borderRadius: "var(--radius-admin-card)",
        background: "linear-gradient(135deg, var(--color-admin-primary) 0%, var(--color-admin-primary-light) 100%)",
      }}
    >
      <div
        className="bg-white flex flex-col flex-grow relative z-10 p-5"
        style={{
          borderRadius: "var(--radius-admin-card)",
          marginTop: 4,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--color-admin-text-secondary)" }}
          >
            {title}
          </span>
          {Icon && (
            <div
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(59,130,246,0.12) 100%)",
                border: "1px solid rgba(37,99,235,0.25)",
              }}
            >
              <Icon
                sx={{
                  color: "var(--color-admin-primary-light)",
                  fontSize: 20,
                  transition: "transform 0.3s",
                }}
                className="group-hover:scale-110"
              />
            </div>
          )}
        </div>

        <span
          className="font-extrabold leading-none mb-1"
          style={{
            fontSize: 26,
            color: "var(--color-admin-text)",
          }}
        >
          {value}
        </span>

        {showChange && (
          <span
            className="text-[11px] font-bold tracking-wide"
            style={{ color: changeColor || "var(--color-admin-muted)" }}
          >
            {subtitle || `${change} from last month`}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
