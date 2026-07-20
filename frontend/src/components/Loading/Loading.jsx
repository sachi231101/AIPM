import { SkeletonGrid } from "../Skeleton/Skeleton";

export default function Loading() {
  return (
    <div className="container py-5">
      <SkeletonGrid count={6} />
    </div>
  );
}
