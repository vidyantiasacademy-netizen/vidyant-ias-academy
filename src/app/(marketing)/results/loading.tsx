import { Container } from "@/components/ui/Container";
import { CardGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="border-b border-line bg-paper py-12 sm:py-16 lg:py-20">
        <Container size="wide">
          <Skeleton className="h-3.5 w-40 bg-paper-200" />
          <Skeleton className="mt-6 h-10 w-3/4 max-w-2xl bg-paper-200" />
          <Skeleton className="mt-5 h-5 w-full max-w-xl bg-paper-200" />
        </Container>
      </div>
      <Container size="wide" className="py-14 sm:py-18 lg:py-24">
        <Skeleton className="h-10 w-full max-w-lg" />
        <div className="mt-8">
          <CardGridSkeleton />
        </div>
      </Container>
    </>
  );
}
