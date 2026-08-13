import { getContactLocation } from "@/lib/contact/contact-location";
import { ContactLocationForm } from "@/components/admin/ContactLocationForm";

export default async function ContactLocationPage() {
  const location = await getContactLocation();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-heading">
          Contact & Location
        </h2>

        <p className="mt-2 text-body text-muted-foreground">
          Kelola informasi kontak, lokasi, dan jam operasional masjid.
        </p>
      </div>

      {!location ? (
        <div className="rounded-lg border border-border bg-card p-6 text-body text-muted-foreground">
          Contact location has not been configured yet. Fill in the form below to create it.
        </div>
      ) : null}

      <ContactLocationForm
        location={
          location
            ? {
                ...location,
                // Decimal objects can't cross the Server -> Client Component
                // boundary as-is — serialize to plain strings first.
                latitude: location.latitude?.toString() ?? null,
                longitude: location.longitude?.toString() ?? null,
              }
            : null
        }
      />
    </div>
  );
}
