import { useCallback, useState } from 'react';
import { type StartRunParams } from '../services/agentService';
import { toast } from '@/components/ui/sonner';

const GITHUB_REPO_URL_REGEX = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/i;

export function useRunForm(onSubmit: (params: StartRunParams) => void) {
  const [repoUrl, setRepoUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [mode, setMode] = useState<"individual" | "team">('individual');
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(95);

  const submitForm = useCallback(() => {
    if (!repoUrl || !userName) {
      toast.error('Repository URL and team name are required.');
      return;
    }

    const trimmedRepoUrl = repoUrl.trim();
    if (!GITHUB_REPO_URL_REGEX.test(trimmedRepoUrl)) {
      toast.error('Invalid repository URL. Please use https://github.com/owner/repo');
      return;
    }

    onSubmit({
      repoUrl: trimmedRepoUrl,
      userName,
      leaderName: leaderName || userName,
      mode,
      autoApproveEnabled,
      confidenceThreshold,
    });
  }, [autoApproveEnabled, confidenceThreshold, leaderName, mode, onSubmit, repoUrl, userName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return {
    repoUrl,
    setRepoUrl,
    userName,
    setUserName,
    leaderName,
    setLeaderName,
    mode,
    setMode,
    autoApproveEnabled,
    setAutoApproveEnabled,
    confidenceThreshold,
    setConfidenceThreshold,
    handleSubmit,
    submitForm,
  };
}