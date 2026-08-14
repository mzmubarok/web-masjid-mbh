-- CreateTable
CREATE TABLE "FinancialSyncRun" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "created" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "FinancialSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialSyncRun_startedAt_idx" ON "FinancialSyncRun"("startedAt");

-- CreateIndex
CREATE INDEX "FinancialSyncRun_status_idx" ON "FinancialSyncRun"("status");
