-- CreateTable
CREATE TABLE "booking_nights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "booking_nights_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booking_nights_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "booking_nights_booking_id_idx" ON "booking_nights"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_nights_property_id_date_key" ON "booking_nights"("property_id", "date");
