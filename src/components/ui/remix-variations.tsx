"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TargetAudienceDropdown } from '@/components/ui/target-audience-dropdown';

// Types for remix variations
export interface HookVariation {
  id: string;
  type: 'question' | 'context' | 'bold_statement' | 'curiosity_gap';
  content: string;
  reasoning: string;
}

export interface TitleVariation {
  title: string;
  reasoning: string;
  clickability_score: number;
}

export interface PayoffScenario {
  id: string;
  type: 'unexpected_reveal' | 'action_plan' | 'transformation_story' | 'cliffhanger' | 'call_to_action';
  title: string;
  description: string;
  content: string;
  reasoning: string;
}

export interface RemixVariations {
  hookVariations: HookVariation[];
  titleVariations: TitleVariation[];
  payoffScenarios: PayoffScenario[];
}

interface RemixVariationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateVariations: (targetAudience: string, selectedHook?: string, customInstructions?: string) => Promise<void>;
  onFinalRemix: (selections: {
    hook: HookVariation;
    title: TitleVariation;
    payoff: PayoffScenario;
    targetAudience: string;
    customInstructions?: string;
  }) => Promise<void>;
  variations: RemixVariations | null;
  isGeneratingVariations: boolean;
  isGeneratingFinal: boolean;
  selectedHook?: string;
  currentTargetAudience: string;
}

export function RemixVariationsModal({
  isOpen,
  onClose,
  onGenerateVariations,
  onFinalRemix,
  variations,
  isGeneratingVariations,
  isGeneratingFinal,
  selectedHook,
  currentTargetAudience
}: RemixVariationsModalProps) {
  const [step, setStep] = useState<'input' | 'select' | 'generating'>('input');
  const [customInstructions, setCustomInstructions] = useState('');
  const [targetAudience, setTargetAudience] = useState(currentTargetAudience);
  
  // Selection state
  const [selectedHookVar, setSelectedHookVar] = useState<HookVariation | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<TitleVariation | null>(null);
  const [selectedPayoff, setSelectedPayoff] = useState<PayoffScenario | null>(null);

  // Handle step transitions based on props
  useEffect(() => {
    if (!isGeneratingVariations && variations && step === 'generating') {
      console.log('🎭 Variations received, moving to selection step');
      setStep('select');
    }
  }, [isGeneratingVariations, variations, step]);

  const handleGenerateVariations = async () => {
    console.log('🎭 Starting remix variations generation...', {
      targetAudience,
      selectedHook,
      customInstructions
    });
    setStep('generating');
    try {
      await onGenerateVariations(targetAudience, selectedHook, customInstructions);
      console.log('🎭 Remix variations completed successfully');
      // Don't set step here - let the useEffect handle it based on props
    } catch (error) {
      console.error('🎭 Error generating remix variations:', error);
      // Reset to input step on error
      setStep('input');
    }
  };

  const handleFinalRemix = async () => {
    if (selectedHookVar && selectedTitle && selectedPayoff) {
      await onFinalRemix({
        hook: selectedHookVar,
        title: selectedTitle,
        payoff: selectedPayoff,
        targetAudience,
        customInstructions
      });
      handleClose();
    }
  };

  const handleClose = () => {
    if (!isGeneratingVariations && !isGeneratingFinal) {
      setStep('input');
      setCustomInstructions('');
      setSelectedHookVar(null);
      setSelectedTitle(null);
      setSelectedPayoff(null);
      onClose();
    }
  };

  const allSelected = selectedHookVar && selectedTitle && selectedPayoff;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
          <DialogTitle className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            🎭 Enhanced Script Remix
            <span className="text-sm font-normal text-gray-600">
              {step === 'input' && '• Step 1: Configuration'}
              {step === 'generating' && '• Generating Variations...'}
              {step === 'select' && '• Step 2: Select Variations (3x3x3)'}
            </span>
          </DialogTitle>

          {/* Step 1: Input and Configuration */}
          {step === 'input' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">How It Works</h3>
                <p className="text-sm text-blue-800">
                  We'll generate 3 variations each for <strong>hooks</strong>, <strong>titles</strong>, and <strong>payoff scenarios</strong>. 
                  You can then mix and match to create your perfect remix (3×3×3 = 27 possible combinations!)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <TargetAudienceDropdown
                  value={targetAudience}
                  onValueChange={setTargetAudience}
                  disabled={isGeneratingVariations}
                />
                <p className="text-xs text-gray-600 mt-1">
                  All hooks, titles, and payoff scenarios will be tailored for this audience
                </p>
              </div>

              {selectedHook && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Hook (for inspiration):
                  </label>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="text-sm text-green-800">{selectedHook}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Any specific requirements for your remix variations? e.g., 'Focus on beginners', 'Make it more urgent', 'Add humor'..."
                  className="h-24"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateVariations}
                  disabled={isGeneratingVariations}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGeneratingVariations ? '🎲 Generating Variations...' : '🎲 Generate 3×3×3 Variations'}
                </Button>
              </div>
            </div>
          )}

          {/* Generating State */}
          {(step === 'generating' || isGeneratingVariations) && (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                🎲 Creating Your Remix Variations...
              </h3>
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full animate-pulse transition-all duration-1000" 
                       style={{width: isGeneratingVariations ? '85%' : '30%'}}></div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-gray-700">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span className="font-medium">AI Analyzing Your Script...</span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">
                    Generating <strong>3 hooks</strong> × <strong>3 titles</strong> × <strong>3 payoff scenarios</strong>
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800 mb-1">
                      🎯 Target Audience: <strong>{targetAudience}</strong>
                    </p>
                    {selectedHook && (
                      <p className="text-blue-700">
                        🎣 Using hook inspiration: "{selectedHook.substring(0, 50)}..."
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">
                    Processing with OpenAI GPT-4 for maximum quality
                  </p>
                  <p className="text-xs text-gray-400">
                    ⏱️ Estimated time: 15-45 seconds
                  </p>
                </div>
                
                {/* Helpful tip while waiting */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Tip:</strong> Each variation uses different psychological triggers to maximize engagement with your target audience.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Variation Selection */}
          {step === 'select' && variations && (
            <div className="space-y-8">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-1">Select Your Perfect Combination</h3>
                <p className="text-sm text-purple-800">
                  Choose 1 hook + 1 title + 1 payoff scenario. Selected: {
                    [selectedHookVar, selectedTitle, selectedPayoff].filter(Boolean).length
                  }/3
                </p>
              </div>

              {/* Hook Variations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  🎣 Hook Variations 
                  <span className="text-sm font-normal text-gray-600">(Choose 1)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {variations.hookVariations.map((hook, index) => (
                    <VariationCard
                      key={hook.id}
                      title={`Hook ${index + 1}: ${hook.type.replace('_', ' ')}`}
                      content={hook.content}
                      reasoning={hook.reasoning}
                      isSelected={selectedHookVar?.id === hook.id}
                      onClick={() => setSelectedHookVar(hook)}
                      variant="hook"
                    />
                  ))}
                </div>
              </div>

              {/* Title Variations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  📝 Title Variations 
                  <span className="text-sm font-normal text-gray-600">(Choose 1)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {variations.titleVariations.map((title, index) => (
                    <VariationCard
                      key={index}
                      title={`Title ${index + 1}`}
                      content={title.title}
                      reasoning={title.reasoning}
                      score={title.clickability_score}
                      isSelected={selectedTitle?.title === title.title}
                      onClick={() => setSelectedTitle(title)}
                      variant="title"
                    />
                  ))}
                </div>
              </div>

              {/* Payoff Scenarios */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  🎯 Payoff Scenarios 
                  <span className="text-sm font-normal text-gray-600">(Choose 1)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {variations.payoffScenarios.map((payoff, index) => (
                    <VariationCard
                      key={payoff.id}
                      title={`${index + 1}. ${payoff.title}`}
                      subtitle={payoff.type.replace('_', ' ')}
                      content={payoff.description}
                      reasoning={payoff.reasoning}
                      fullContent={payoff.content}
                      isSelected={selectedPayoff?.id === payoff.id}
                      onClick={() => setSelectedPayoff(payoff)}
                      variant="payoff"
                    />
                  ))}
                </div>
              </div>

              {/* Final Generation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('input')}
                  disabled={isGeneratingFinal}
                >
                  ← Back to Edit
                </Button>
                <Button 
                  onClick={handleFinalRemix}
                  disabled={!allSelected || isGeneratingFinal}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
                >
                  {isGeneratingFinal ? '🎬 Creating Remix...' : `🎬 Create Final Remix ${allSelected ? '(Ready!)' : `(${[selectedHookVar, selectedTitle, selectedPayoff].filter(Boolean).length}/3)`}`}
                </Button>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// Individual variation card component
interface VariationCardProps {
  title: string;
  subtitle?: string;
  content: string;
  reasoning: string;
  fullContent?: string;
  score?: number;
  isSelected: boolean;
  onClick: () => void;
  variant: 'hook' | 'title' | 'payoff';
}

function VariationCard({
  title,
  subtitle,
  content,
  reasoning,
  fullContent,
  score,
  isSelected,
  onClick,
  variant
}: VariationCardProps) {
  const [showFull, setShowFull] = useState(false);
  
  const variantStyles = {
    hook: {
      border: 'border-blue-200',
      bg: isSelected ? 'bg-blue-100 border-blue-400' : 'bg-blue-50',
      accent: 'text-blue-700'
    },
    title: {
      border: 'border-green-200',
      bg: isSelected ? 'bg-green-100 border-green-400' : 'bg-green-50',
      accent: 'text-green-700'
    },
    payoff: {
      border: 'border-purple-200',
      bg: isSelected ? 'bg-purple-100 border-purple-400' : 'bg-purple-50',
      accent: 'text-purple-700'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div 
      className={`${styles.bg} ${styles.border} border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-medium ${styles.accent} text-sm uppercase tracking-wide`}>
          {title}
        </h4>
        <div className="flex items-center gap-2">
          {score && (
            <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-700">
              {score}/10
            </span>
          )}
          {isSelected && (
            <span className="text-green-600 text-sm">✓</span>
          )}
        </div>
      </div>
      
      {subtitle && (
        <p className={`text-xs ${styles.accent} mb-2 font-medium`}>
          {subtitle}
        </p>
      )}
      
      <div className="space-y-3">
        <div className="bg-white p-3 rounded border">
          <p className="text-gray-900 font-medium text-sm leading-relaxed">
            {content}
          </p>
        </div>
        
        {fullContent && variant === 'payoff' && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFull(!showFull);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showFull ? '▲ Hide Content' : '▼ Show Full Content'}
            </button>
            {showFull && (
              <div className="mt-2 bg-white p-3 rounded border">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {fullContent}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white p-2 rounded border-l-4 border-gray-300">
          <p className="text-gray-600 text-xs">
            <strong>Why this works:</strong> {reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}