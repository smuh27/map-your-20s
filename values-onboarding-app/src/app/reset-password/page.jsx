import React, { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

export default function ResetPasswordPage({ searchParams }) {
  return (
    <div>
      <Suspense
        fallback={
          <div className="max-w-md mx-auto mt-10">
            <p>Loading reset form…</p>
          </div>
        }
      >
        <ResetPasswordClient searchParams={searchParams} />
      </Suspense>
    </div>
  );
}