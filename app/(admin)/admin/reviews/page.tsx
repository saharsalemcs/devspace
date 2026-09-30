import { Metadata } from "next";
import { AdminReviewsList } from "./admin-reviews-list";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function AdminReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 text-foreground font-bold">Reviews</h1>
      <AdminReviewsList />
    </div>
  );
}
