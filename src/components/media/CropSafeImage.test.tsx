/**
 * CropSafeImage contract tests.
 *
 * These tests exist specifically to prevent regressions where a future
 * edit re-introduces cropping by:
 *   - swapping object-contain for object-cover
 *   - shifting object-position away from center
 *   - exposing className/style props that target the <img>
 *   - dropping intrinsic width/height
 *   - dropping the locked container aspect-ratio
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CropSafeImage, type CropSafeImageProps } from "./CropSafeImage";
import type { ResponsiveAsset } from "@/config/projectImagery";

const responsive: ResponsiveAsset = {
  src: "/img-1536.webp",
  srcSet: "/img-640.webp 640w, /img-1024.webp 1024w, /img-1536.webp 1536w",
  sizes: "100vw",
  widths: [640, 1024, 1536],
};

const baseProps: CropSafeImageProps = {
  responsive,
  alt: "test image",
  aspectRatio: "3 / 2",
  width: 1536,
  height: 1024,
};

const renderImg = (overrides: Partial<CropSafeImageProps> = {}) => {
  const { container } = render(<CropSafeImage {...baseProps} {...overrides} />);
  const img = container.querySelector("img");
  if (!img) throw new Error("img not rendered");
  const wrapper = container.firstElementChild as HTMLElement;
  return { img, wrapper, container };
};

describe("CropSafeImage — crop-safety contract", () => {
  it("renders the image with srcSet, sizes, alt and intrinsic dimensions", () => {
    const { img } = renderImg();
    expect(img.getAttribute("src")).toBe(responsive.src);
    expect(img.getAttribute("srcset")).toBe(responsive.srcSet);
    expect(img.getAttribute("sizes")).toBe(responsive.sizes);
    expect(img.getAttribute("alt")).toBe("test image");
    expect(img.getAttribute("width")).toBe("1536");
    expect(img.getAttribute("height")).toBe("1024");
  });

  it("ALWAYS applies object-contain and object-center to the <img>", () => {
    const { img } = renderImg();
    const cls = img.className;
    expect(cls).toContain("object-contain");
    expect(cls).toContain("object-center");
    expect(cls).not.toContain("object-cover");
  });

  it("locks the container aspect-ratio to the prop value", () => {
    const { wrapper } = renderImg({ aspectRatio: "3 / 2" });
    // jsdom normalises aspect-ratio to "3 / 2"
    expect(wrapper.style.aspectRatio.replace(/\s+/g, "")).toBe("3/2");
  });

  it("defaults to loading=lazy and decoding=async", () => {
    const { img } = renderImg();
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img.getAttribute("decoding")).toBe("async");
  });

  it("does NOT accept a className prop that targets the <img>", () => {
    // The component's public API has no `className` prop for the img,
    // only `containerClassName`. This test documents that fact by
    // attempting an unsafe override and confirming the <img> classes
    // remain pinned to the safe set.
    const unsafe = { className: "object-cover object-top" } as unknown as Partial<CropSafeImageProps>;
    const { img } = renderImg(unsafe);
    expect(img.className).toContain("object-contain");
    expect(img.className).toContain("object-center");
    expect(img.className).not.toContain("object-cover");
    expect(img.className).not.toContain("object-top");
  });

  it("does NOT accept a style prop that mutates object-fit / object-position on the <img>", () => {
    const unsafe = {
      style: { objectFit: "cover", objectPosition: "top left" },
    } as unknown as Partial<CropSafeImageProps>;
    const { img } = renderImg(unsafe);
    expect(img.style.objectFit).toBe("");
    expect(img.style.objectPosition).toBe("");
  });

  it("containerClassName applies to the wrapper, never to the <img>", () => {
    const { wrapper, img } = renderImg({ containerClassName: "border-t border-accent/10" });
    expect(wrapper.className).toContain("border-t");
    expect(img.className).not.toContain("border-t");
  });

  it("filter prop applies to the <img> style without affecting fit/position", () => {
    const { img } = renderImg({ filter: "brightness(0.86) contrast(1.1)" });
    expect(img.style.filter).toContain("brightness");
    expect(img.style.objectFit).toBe("");
    expect(img.style.objectPosition).toBe("");
  });

  it("renders overlay children as siblings of the <img>, not inside it", () => {
    const { wrapper, img } = renderImg({
      children: <div data-testid="overlay" className="absolute inset-0" />,
    });
    const overlay = wrapper.querySelector('[data-testid="overlay"]');
    expect(overlay).not.toBeNull();
    expect(img.contains(overlay!)).toBe(false);
  });

  it("TypeScript public API exposes no `className` or `style` field for the <img>", () => {
    // Compile-time guard: if someone adds an `imgClassName`/`imgStyle`/`className`
    // prop in the future, this @ts-expect-error line will start failing,
    // forcing them to read this test and reconsider.
    // @ts-expect-error — className is intentionally NOT part of CropSafeImageProps
    const _a: CropSafeImageProps = { ...baseProps, className: "x" };
    // @ts-expect-error — style is intentionally NOT part of CropSafeImageProps
    const _b: CropSafeImageProps = { ...baseProps, style: { objectFit: "cover" } };
    void _a;
    void _b;
    expect(true).toBe(true);
  });
});
