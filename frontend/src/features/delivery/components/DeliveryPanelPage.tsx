import { useState } from "react";
import { getLegacyDeliveryAvailableOrderViewModels, getLegacyDeliveryCompletedTripViewModels, getSedesLegacy } from "../../../services";
import type { Page } from "../../../app/types";
import { DeliveryAssignedOrders } from "./DeliveryAssignedOrders";
import { DeliveryAvailableOrders } from "./DeliveryAvailableOrders";
import { DeliveryCompletedTrips } from "./DeliveryCompletedTrips";
import { DeliveryHeader } from "./DeliveryHeader";
import { DeliveryMaxTripsModal } from "./DeliveryMaxTripsModal";
import { DeliveryPinModal } from "./DeliveryPinModal";
import { DeliveryTabs } from "./DeliveryTabs";

const SEDES = getSedesLegacy();
const COMPLETED_TRIPS_DEMO = getLegacyDeliveryCompletedTripViewModels();
const DEMO_OTP = "1234";

export function DeliveryPanel({ onNav, userSede }: { onNav: (p: Page) => void; userSede?: string }) {
  const [activeTab, setActiveTab] = useState<"available" | "myTrips" | "completed">("available");
  // If userSede is set (not "Todas"), lock to that sede; otherwise allow switching
  const hasAllSedes = !userSede || userSede === "Todas";
  const [selectedSede, setSelectedSede] = useState(hasAllSedes ? "principal" : (userSede ?? "principal"));
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [myTrips, setMyTrips] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showMaxTripsModal, setShowMaxTripsModal] = useState(false);

  // Completed trips filters
  const [ctDateFrom, setCtDateFrom] = useState("");
  const [ctDateTo, setCtDateTo] = useState("");
  const [ctSede, setCtSede] = useState("todas");

  const allOrders = getLegacyDeliveryAvailableOrderViewModels();
  const availableOrders = allOrders.filter(o => o.sede === selectedSede && !myTrips.includes(o.id));
  const myTripOrders = allOrders.filter(o => myTrips.includes(o.id));

  const handleAssignOrder = (orderId: string) => {
    if (myTrips.length >= 3) {
      setShowMaxTripsModal(true);
      return;
    }
    setMyTrips(prev => [...prev, orderId]);
  };

  const handleDelivery = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowPinModal(true);
    setPinInput("");
  };

  const verifyPin = () => {
    if (pinInput === DEMO_OTP) {
      setShowPinModal(false);
      setMyTrips(prev => prev.filter(id => id !== selectedOrder));
      setSelectedOrder(null);
      setPinInput("");
    }
  };

  const handlePinKeyPress = (key: string) => {
    if (key === "del") {
      setPinInput(p => p.slice(0, -1));
    } else if (pinInput.length < 4) {
      setPinInput(p => p + key);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf7]">
      {showPinModal && (
        <DeliveryPinModal
          pinInput={pinInput}
          onCancel={() => setShowPinModal(false)}
          onKeyPress={handlePinKeyPress}
          onVerify={verifyPin}
        />
      )}

      {showMaxTripsModal && (
        <DeliveryMaxTripsModal onClose={() => setShowMaxTripsModal(false)} />
      )}

      <DeliveryHeader onNav={onNav} userSede={userSede} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <DeliveryTabs activeTab={activeTab} myTripsCount={myTrips.length} onTabChange={setActiveTab} />

        {activeTab === "available" && (
          <DeliveryAvailableOrders
            hasAllSedes={hasAllSedes}
            selectedSede={selectedSede}
            sedes={SEDES}
            availableOrders={availableOrders}
            expandedOrder={expandedOrder}
            onSedeChange={setSelectedSede}
            onExpandedOrderChange={setExpandedOrder}
            onAssignOrder={(orderId) => {
              handleAssignOrder(orderId);
              setExpandedOrder(null);
            }}
          />
        )}

        {activeTab === "completed" && (
          <DeliveryCompletedTrips
            trips={COMPLETED_TRIPS_DEMO}
            dateFrom={ctDateFrom}
            dateTo={ctDateTo}
            sede={ctSede}
            sedes={SEDES}
            onDateFromChange={setCtDateFrom}
            onDateToChange={setCtDateTo}
            onSedeChange={setCtSede}
          />
        )}

        {activeTab === "myTrips" && (
          <DeliveryAssignedOrders
            orders={myTripOrders}
            onConfirmDelivery={handleDelivery}
          />
        )}
      </div>
    </div>
  );
}
