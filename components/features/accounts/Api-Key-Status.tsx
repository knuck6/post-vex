"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "lucide-react";

export function ApiKeySettings() {
  const [apiKey, setApiKey] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  
  // 1. Reactive query (updates automatically when DB changes)
  const keyStatus = useQuery(api.users.getApiKeyStatus);

  // 2. Mutations & Actions
  const setApiKeyMutation = useMutation(api.users.updateZernioKey);
  const validateApiKeyAction = useAction(api.users.validateApiKey);

  const handleSetKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    await setApiKeyMutation({ zernioKey:apiKey });
    setApiKey("");
    setShowInput(false);
    setValidationResult(null);
  };

 

  const handleValidateKey = async () => {
    setIsValidating(true);
    try {
      const valid = await validateApiKeyAction();
      setValidationResult(valid?true:false);
    } finally {
      setIsValidating(false);
    }
  };

  if (keyStatus === undefined) {
    return <div className="text-sm text-gray-500">.. Cheia zernio <Loader className="size-6 animate-spin"/>...</div>;
  }

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <h3 className="font-semibold text-base">Cheia Zernio</h3>

      {keyStatus?.hasKey ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Cheia ta:</span>
            <code className="bg-gray-100 dark:bg-gray-600/60 px-2 py-1 rounded text-xs font-mono">
              {keyStatus.maskedKey}
            </code>
          </div>

          {validationResult !== null && (
            <p className={`text-xs ${validationResult ? "dark:text-green-600 text-blue-600 font-bold leading-relaxed" : "text-red-600"}`}>
              {validationResult ? "Key is valid and active" : "Invalid API key"}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleValidateKey}
              disabled={isValidating}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-30"
            >
              {isValidating ? "Verific..." : "Verifica cheia"}
            </button>
           
          </div>
        </div>
      ) : (
        <div>
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800"
            >
              Add Zernio API Key
            </button>
          ) : (
            <form onSubmit={handleSetKey} className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_..."
                className="border text-sm p-1.5 rounded flex-1"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowInput(false)}
                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}