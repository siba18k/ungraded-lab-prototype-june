'use client';
import { useEffect, useState } from 'react';
import { subscribeToNurseQueue, subscribeToDoctorQueue } from '@/firebase/triageCases';
import { TriageCase } from '@/types/ncedocare';

export const useNurseQueue = (facilityId: string | null) => {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facilityId) return;
    setLoading(true);
    const unsub = subscribeToNurseQueue(facilityId, data => {
      setCases(data);
      setLoading(false);
    });
    return () => unsub();
  }, [facilityId]);

  return { cases, loading };
};

export const useDoctorQueue = (facilityId: string | null) => {
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facilityId) return;
    setLoading(true);
    const unsub = subscribeToDoctorQueue(facilityId, data => {
      setCases(data);
      setLoading(false);
    });
    return () => unsub();
  }, [facilityId]);

  return { cases, loading };
};
