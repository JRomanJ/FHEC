import { H9 } from "./deliveryShared";

type DeliveryTabsProps = {
  activeTab: "available" | "myTrips" | "completed";
  myTripsCount: number;
  onTabChange: (tab: "available" | "myTrips" | "completed") => void;
};

export function DeliveryTabs({ activeTab, myTripsCount, onTabChange }: DeliveryTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-6 border-b border-border">
      <button
        onClick={() => onTabChange("available")}
        className={`px-6 py-3 text-sm font-black uppercase transition-all relative
          ${activeTab === "available" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
        style={H9}
      >
        Pedidos Disponibles
        {activeTab === "available" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
      </button>
      <button
        onClick={() => onTabChange("myTrips")}
        className={`px-6 py-3 text-sm font-black uppercase transition-all relative
          ${activeTab === "myTrips" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
        style={H9}
      >
        Mis Viajes ({myTripsCount})
        {activeTab === "myTrips" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
      </button>
      <button
        onClick={() => onTabChange("completed")}
        className={`px-6 py-3 text-sm font-black uppercase transition-all relative
          ${activeTab === "completed" ? "text-[#179150]" : "text-muted-foreground hover:text-foreground"}`}
        style={H9}
      >
        Viajes Completados
        {activeTab === "completed" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#179150]" />}
      </button>
    </div>
  );
}
