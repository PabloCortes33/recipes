import { useState, useCallback } from 'react';
import { recipeAPI } from '../services/api';
import { useJobPolling } from './useJobPolling';

export const useRecipeGeneration = () => {
  const [currentJobId, setCurrentJobId] = useState(null);
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { job, isPolling } = useJobPolling(currentJobId, {
    onComplete: (completedJob) => {
      setRecipes(completedJob.recipes);
      setIsGenerating(false);
      setError(null);
    },
    onError: (errorJob) => {
      setError(errorJob.error || 'Recipe generation failed');
      setIsGenerating(false);
    },
    enabled: !!currentJobId && isGenerating,
  });

  const generateRecipe = useCallback(async (prompt, mode = 'create') => {
    try {
      setIsGenerating(true);
      setError(null);
      setRecipes(null);
      
      const response = await recipeAPI.generate(prompt, mode);
      
      if (response.data.success && response.data.jobId) {
        setCurrentJobId(response.data.jobId);
      } else {
        throw new Error(response.data.error || 'Failed to start generation');
      }
    } catch (err) {
      setIsGenerating(false);
      setError(err.response?.data?.error || err.message || 'Failed to generate recipe');
    }
  }, []);

  const refineRecipe = useCallback(async (jobId, refinementPrompt) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await recipeAPI.refine(jobId, refinementPrompt);
      
      if (response.data.success) {
        // Poll the original job (it will be updated)
        const jobIdToPoll = response.data.originalJobId || jobId;
        setCurrentJobId(jobIdToPoll);
      } else {
        throw new Error(response.data.error || 'Failed to refine recipe');
      }
    } catch (err) {
      setIsGenerating(false);
      setError(err.response?.data?.error || err.message || 'Failed to refine recipe');
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentJobId(null);
    setRecipes(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    generateRecipe,
    refineRecipe,
    recipes,
    error,
    isGenerating: isGenerating || isPolling,
    currentJobId,
    job,
    reset,
  };
};

