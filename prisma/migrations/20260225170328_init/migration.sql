-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "webhookUrl" TEXT,
    "webhookNote" TEXT,
    "color" TEXT NOT NULL DEFAULT '#25D366',
    "bgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "totalScans" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrCodeId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scan_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_slug_key" ON "QRCode"("slug");
