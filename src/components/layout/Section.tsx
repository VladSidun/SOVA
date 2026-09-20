import type { ComponentPropsWithoutRef } from "react";
import { Container } from "./Container";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  containerClassName?: string;
};

export function Section({
  children,
  className = "",
  containerClassName = "",
  ...props
}: SectionProps) {
  return (
    <section className={`py-12 sm:py-16 ${className}`.trim()} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
