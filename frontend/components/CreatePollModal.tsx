"use client";

import { useState, useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POLL_FACTORY_ADDRESS, POLL_FACTORY_ABI } from "@/lib/contracts";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Changed to just trigger refetch
  initialQuestion?: string;
  initialOptions?: string[];
  initialDuration?: number;
  initialMaxWeightCap?: number;
}

export function CreatePollModal({
  isOpen,
  onClose,
  onSuccess,
  initialQuestion = "",
  initialOptions = ["", ""],
  initialDuration = 7,
  initialMaxWeightCap = 10,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [options, setOptions] = useState(initialOptions);
  const [duration, setDuration] = useState(initialDuration);
  const [maxWeightCap, setMaxWeightCap] = useState(initialMaxWeightCap);

  // IMPORTANT: only apply initial values ONCE when the modal opens.
  // Otherwise parent re-renders (e.g. new array references) will overwrite the user's typing.
  const didInitOnOpenRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      didInitOnOpenRef.current = false;
      return;
    }
    if (didInitOnOpenRef.current) return;

    didInitOnOpenRef.current = true;
    setQuestion(initialQuestion);
    setOptions(initialOptions.length >= 2 ? initialOptions : ["", ""]);
    setDuration(initialDuration);
    setMaxWeightCap(initialMaxWeightCap);
  }, [isOpen, initialQuestion, initialOptions, initialDuration, initialMaxWeightCap]);

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle successful poll creation
  useEffect(() => {
    if (isSuccess && hash) {
      console.log("Poll creation transaction confirmed! Hash:", hash);
      toast.success("Poll created successfully!");

      // Wait a bit for the blockchain to propagate
      setTimeout(() => {
        console.log("Calling onSuccess to refresh poll list...");
        onSuccess(); // Trigger refetch in parent
        
        setTimeout(() => {
          onClose();

          // Reset form
          setQuestion("");
          setOptions(["", ""]);
          setDuration(7);
          setMaxWeightCap(10);
          reset();
        }, 500);
      }, 3000); // 3 second delay for blockchain propagation
    }
  }, [isSuccess, hash, onSuccess, onClose, reset]);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options");
      return;
    }

    try {
      writeContract({
        address: POLL_FACTORY_ADDRESS,
        abi: POLL_FACTORY_ABI,
        functionName: "createPoll",
        args: [
          question,
          validOptions,
          BigInt(duration * 24 * 60 * 60), // Convert days to seconds
          BigInt(maxWeightCap),
        ],
      });

      toast.success("Creating poll...");
    } catch (error: any) {
      toast.error(error.message || "Failed to create poll");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl border border-slate-700/50 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-black/50">
        <div className="p-6 border-b border-slate-800/60 bg-slate-950/40">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                Create New Poll
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                This will deploy a new on-chain poll via the PollFactory.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-84px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-slate-200 mb-2 font-semibold">
                Poll Question *
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What should we prioritize next?"
                className="w-full px-4 py-3 bg-slate-900/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/50 transition-colors"
                maxLength={200}
              />
              <p className="text-xs text-slate-500 mt-1">
                {question.length}/200
              </p>
            </div>

            {/* Options */}
            <div>
              <label className="block text-slate-200 mb-2 font-semibold">
                Options * (2-10)
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-slate-900/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/50 transition-colors"
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-4 py-2 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/25 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 hover:bg-emerald-500/25 transition-colors text-sm font-semibold"
                >
                  + Add Option
                </button>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-slate-200 mb-2 font-semibold">
                Duration: {duration} days
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-emerald-700/30 rounded-lg appearance-none cursor-pointer 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                         [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-emerald-500 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 day</span>
                <span>30 days</span>
              </div>
            </div>

            {/* Weight Cap */}
            <div>
              <label className="block text-slate-200 mb-2 font-semibold">
                Max Vote Weight Cap: {maxWeightCap}x
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={maxWeightCap}
                onChange={(e) => setMaxWeightCap(Number(e.target.value))}
                className="w-full h-2 bg-purple-700/30 rounded-lg appearance-none cursor-pointer 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                         [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-purple-500 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>2x (strict)</span>
                <span>20x (lenient)</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Prevents any single vote from having more than {maxWeightCap}x
                the average weight
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending || isConfirming}
                className="flex-1 px-6 py-3 bg-slate-900/40 border border-slate-700/60 rounded-xl text-slate-200 hover:bg-slate-800/60 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isConfirming || isSuccess}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending
                  ? "Confirm in Wallet..."
                  : isConfirming
                  ? "Creating Poll..."
                  : isSuccess
                  ? "Poll Created! ✓"
                  : "Create Poll"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


