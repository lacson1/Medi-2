import React, { useState } from 'react';
import FinancialAnalyticsComponent from '@/components/billing/FinancialAnalytics';

export default function FinancialAnalytics() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <FinancialAnalyticsComponent
        onRefresh={handleRefresh}
        loading={loading}
      />
    </div>
  );
}