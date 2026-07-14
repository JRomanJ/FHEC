import { Check, Lock, X } from "lucide-react";
import { H9 } from "./deliveryShared";

type DeliveryPinModalProps = {
  pinInput: string;
  onCancel: () => void;
  onKeyPress: (key: string) => void;
  onVerify: () => void;
};

export function DeliveryPinModal({ pinInput, onCancel, onKeyPress, onVerify }: DeliveryPinModalProps) {
  return (
    <div className="fixed inset-0 min-h-screen bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-[#50e9f8]/15 flex items-center justify-center mx-auto mb-4">
          <Lock size={26} className="text-[#179150]" />
        </div>
        <h3 className="text-2xl uppercase text-foreground text-center mb-2" style={H9}>Confirmar Entrega</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
          Ingresa el PIN de 4 dígitos proporcionado por el cliente
        </p>

        <div className="flex gap-2 justify-center mb-6">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-14 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-black transition-all
                ${pinInput[i] ? "border-[#179150] bg-[#179150]/5 text-[#179150]" : "border-border bg-white"}`}
              style={H9}
            >
              {pinInput[i] || ""}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              onClick={() => onKeyPress(String(n))}
              className="h-14 bg-muted hover:bg-[#e0f5eb] border border-border rounded-xl text-lg font-black transition-colors"
              style={H9}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => onKeyPress("del")}
            className="h-14 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-red-600" />
          </button>
          <button
            onClick={() => onKeyPress("0")}
            className="h-14 bg-muted hover:bg-[#e0f5eb] border border-border rounded-xl text-lg font-black transition-colors"
            style={H9}
          >
            0
          </button>
          <button
            onClick={onVerify}
            disabled={pinInput.length !== 4}
            className={`h-14 rounded-xl flex items-center justify-center transition-colors
              ${pinInput.length === 4 ? "bg-[#179150] hover:bg-green-700 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            <Check size={20} />
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">Demo: el PIN es <strong>1234</strong></p>
      </div>
    </div>
  );
}
