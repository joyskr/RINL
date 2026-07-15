const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const pageKey = document.body?.dataset.page;
const rootStyle = document.documentElement.style;

const setHeader = () => header.classList.toggle("scrolled", window.scrollY > 12);
const setHeaderHeight = () => {
  if (header) {
    rootStyle.setProperty("--header-height", `${header.offsetHeight}px`);
  }
};

setHeader();
setHeaderHeight();
window.addEventListener("scroll", setHeader, { passive: true });

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  })
);

nav?.querySelectorAll("[data-nav-link]").forEach((link) => {
  link.classList.toggle("is-active", link.getAttribute("data-nav-link") === pageKey);
});

const yearNode = document.querySelector("[data-year]");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}

document.querySelectorAll("[data-accordion] .accordion-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;
    const active = btn.classList.contains("active");

    document.querySelectorAll(".accordion-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".accordion-content").forEach((item) => item.classList.remove("open"));

    if (!active) {
      btn.classList.add("active");
      content.classList.add("open");
    }
  });
});

const benefitsRoot = document.querySelector("[data-benefits]");
const benefitTabs = benefitsRoot?.querySelectorAll("[data-benefit-tab]");
const benefitPanels = benefitsRoot?.querySelectorAll("[data-benefit-panel]");

if (benefitsRoot && benefitTabs && benefitPanels) {
  const benefitsSection = benefitsRoot.closest(".benefits-band");
  const benefitsContent = benefitsRoot.querySelector(".benefits-content");
  const benefitTabList = [...benefitTabs];
  const benefitPanelList = [...benefitPanels];
  const benefitsMenu = benefitsRoot.querySelector(".benefits-menu");
  let activeBenefitPanel = benefitsRoot.querySelector(".benefit-panel.active");
  let activeBenefitIndex = Math.max(0, benefitPanelList.indexOf(activeBenefitPanel));
  let benefitAnimating = false;
  let benefitTargetIndex = activeBenefitIndex;
  let benefitsMobileLayout = null;

  const setBenefitsHeight = (panel = activeBenefitPanel) => {
    if (!benefitsContent || !panel) {
      return;
    }

    benefitsContent.style.height = `${panel.offsetHeight}px`;
  };

  const setBenefitDuration = (seconds) => {
    benefitsContent?.style.setProperty("--benefit-slide-duration", `${seconds}s`);
  };

  const setActiveBenefitTab = (index) => {
    benefitTabList.forEach((item, itemIndex) => {
      const active = itemIndex === index;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  const setBenefitBackground = (index) => {
    const tab = benefitTabList[index];
    const key = tab?.getAttribute("data-benefit-tab");
    if (key) {
      benefitsSection?.setAttribute("data-benefit-bg", key);
    }
  };

  const isMobileBenefits = () => window.matchMedia("(max-width: 720px)").matches;

  const syncMobileBenefitPanels = () => {
    if (!isMobileBenefits()) {
      benefitPanelList.forEach((panel) => {
        panel.hidden = panel !== activeBenefitPanel;
      });
      return;
    }

    benefitPanelList.forEach((panel, index) => {
      const active = index === benefitTargetIndex;
      panel.hidden = false;
      panel.classList.toggle("active", active);
    });
  };

  const syncBenefitStructure = () => {
    const mobile = isMobileBenefits();
    if (benefitsMobileLayout === mobile) {
      return;
    }

    benefitsMobileLayout = mobile;

    if (mobile) {
      benefitTabList.forEach((tab, index) => {
        const panel = benefitPanelList[index];
        tab.insertAdjacentElement("afterend", panel);
      });
    } else {
      benefitPanelList.forEach((panel) => {
        benefitsContent?.appendChild(panel);
      });
    }
  };

  benefitPanelList.forEach((panel) => {
    if (panel !== activeBenefitPanel) {
      panel.hidden = true;
      panel.classList.remove("active", "is-entering", "is-leaving", "to-left");
    } else {
      panel.hidden = false;
      panel.classList.add("no-motion");
    }
  });

  requestAnimationFrame(() => {
    activeBenefitPanel?.classList.remove("no-motion");
    setBenefitsHeight();
  });
  syncBenefitStructure();
  setBenefitBackground(activeBenefitIndex);
  syncMobileBenefitPanels();

  const finalizeBenefitPanelState = (nextPanel, nextIndex) => {
    if (activeBenefitPanel) {
      activeBenefitPanel.hidden = true;
      activeBenefitPanel.classList.remove("active", "is-leaving", "to-left");
      activeBenefitPanel.style.removeProperty("transform");
    }

    nextPanel.hidden = false;
    nextPanel.classList.add("active");
    nextPanel.classList.remove("is-entering");
    nextPanel.style.removeProperty("transform");
    activeBenefitPanel = nextPanel;
    activeBenefitIndex = nextIndex;
    benefitAnimating = false;
    setBenefitsHeight();
  };

  const runContinuousBenefitTrack = (targetIndex, direction, steps) => {
    const runner = document.createElement("div");
    runner.className = "benefit-runner";

    const indices = [activeBenefitIndex];
    for (let step = 1; step <= steps; step += 1) {
      indices.push(activeBenefitIndex + direction * step);
    }

    indices.forEach((index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "benefit-runner-panel";
      const clone = benefitPanelList[index].cloneNode(true);
      clone.hidden = false;
      clone.classList.remove("active", "is-entering", "is-leaving", "to-left", "no-motion");
      wrapper.appendChild(clone);
      runner.appendChild(wrapper);
    });

    benefitsContent.classList.add("is-track-animating");
    benefitsContent.appendChild(runner);
    setBenefitDuration(Math.max(0.18, Math.min(0.28, 0.48 / steps)));
    setBenefitsHeight(benefitPanelList[targetIndex]);

    const finishTrack = (event) => {
      if (event.target !== runner || event.propertyName !== "transform") {
        return;
      }

      runner.removeEventListener("transitionend", finishTrack);
      runner.remove();
      benefitsContent.classList.remove("is-track-animating");
      finalizeBenefitPanelState(benefitPanelList[targetIndex], targetIndex);
      if (benefitTargetIndex !== targetIndex) {
        processBenefitQueue();
      }
    };

    runner.addEventListener("transitionend", finishTrack);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runner.style.transition = `transform ${Math.max(0.32, Math.min(0.7, steps * 0.16))}s ease`;
        runner.style.transform = `translateX(${-steps * 100}%)`;
      });
    });
  };

  const runBenefitStep = (nextIndex, durationSeconds, direction) => {
    const nextPanel = benefitPanelList[nextIndex];

    if (!nextPanel || nextPanel === activeBenefitPanel) {
      return;
    }

    benefitAnimating = true;
    setBenefitDuration(durationSeconds);
    setActiveBenefitTab(benefitTargetIndex);

    nextPanel.hidden = false;
    nextPanel.classList.remove("no-motion", "to-left", "active");
    nextPanel.classList.add("is-entering");

    if (direction < 0) {
      nextPanel.style.transform = "translateX(-100%)";
      activeBenefitPanel?.style.removeProperty("transform");
    } else {
      nextPanel.style.removeProperty("transform");
    }

    activeBenefitPanel?.classList.add("is-leaving");
    activeBenefitPanel?.classList.toggle("to-left", direction > 0);
    if (direction < 0 && activeBenefitPanel) {
      activeBenefitPanel.style.transform = "translateX(100%)";
    }

    setBenefitsHeight(nextPanel);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nextPanel.classList.add("active");
        if (direction < 0) {
          nextPanel.style.transform = "translateX(0)";
        }

        if (activeBenefitPanel && direction < 0) {
          activeBenefitPanel.style.transform = "translateX(100%)";
        }
      });
    });

    const finishTransition = (event) => {
      if (event.target !== nextPanel || event.propertyName !== "transform") {
        return;
      }

      nextPanel.removeEventListener("transitionend", finishTransition);
      finalizeBenefitPanelState(nextPanel, nextIndex);
      processBenefitQueue();
    };

    nextPanel.addEventListener("transitionend", finishTransition);
  };

  const processBenefitQueue = () => {
    if (isMobileBenefits()) {
      activeBenefitIndex = benefitTargetIndex;
      activeBenefitPanel = benefitPanelList[benefitTargetIndex];
      setActiveBenefitTab(benefitTargetIndex);
      setBenefitBackground(benefitTargetIndex);
      syncMobileBenefitPanels();
      benefitAnimating = false;
      return;
    }

    if (benefitAnimating || benefitTargetIndex === activeBenefitIndex) {
      setActiveBenefitTab(benefitTargetIndex);
      return;
    }

    const remainingSteps = Math.abs(benefitTargetIndex - activeBenefitIndex);
    const direction = benefitTargetIndex > activeBenefitIndex ? 1 : -1;
    if (remainingSteps > 1) {
      benefitAnimating = true;
      setActiveBenefitTab(benefitTargetIndex);
      runContinuousBenefitTrack(benefitTargetIndex, direction, remainingSteps);
      return;
    }

    const nextIndex = activeBenefitIndex + direction;
    runBenefitStep(nextIndex, 0.45, direction);
  };

  benefitTabList.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      if (isMobileBenefits() && benefitTargetIndex === index) {
        return;
      }

      benefitTargetIndex = index;
      setActiveBenefitTab(index);
      setBenefitBackground(index);

      if (!benefitAnimating) {
        processBenefitQueue();
      }
    });
  });

window.addEventListener("resize", () => {
  setHeaderHeight();
  syncBenefitStructure();
  setBenefitsHeight();
  syncMobileBenefitPanels();
});
}

const whyCarousel = document.querySelector("[data-why-carousel]");
const whyTrack = whyCarousel?.querySelector("[data-why-track]");
const whySlides = whyCarousel ? [...whyCarousel.querySelectorAll("[data-why-slide]")] : [];
const whyDots = whyCarousel ? [...whyCarousel.querySelectorAll("[data-why-dot]")] : [];

if (whyCarousel && whyTrack && whySlides.length) {
  const whyOriginalCount = whySlides.length;
  const whyPrefixClones = [
    whySlides[whyOriginalCount - 2].cloneNode(true),
    whySlides[whyOriginalCount - 1].cloneNode(true),
  ];
  const whySuffixClones = [
    whySlides[0].cloneNode(true),
    whySlides[1].cloneNode(true),
  ];
  const whyLoopSlides = [...whyPrefixClones, ...whySlides, ...whySuffixClones];

  [...whyPrefixClones, ...whySuffixClones].forEach((slide) => slide.removeAttribute("data-why-slide"));
  whyTrack.innerHTML = "";
  whyLoopSlides.forEach((slide) => whyTrack.appendChild(slide));

  const whyRenderedSlides = [...whyTrack.children];
  const whyStartIndex = 2;
  let whyIndex = whyStartIndex;
  let whyTimer;
  let whyLocked = false;

  const getWhyLogicalIndex = (renderedIndex) =>
    ((renderedIndex - whyStartIndex) % whyOriginalCount + whyOriginalCount) % whyOriginalCount;

  const updateWhyVisualState = () => {
    const logicalIndex = getWhyLogicalIndex(whyIndex);

    whyRenderedSlides.forEach((slide, index) => {
      const relative = index - whyIndex;

      slide.classList.remove("prev", "active", "next", "far");

      if (relative === 0) {
        slide.classList.add("active");
      } else if (relative === -1) {
        slide.classList.add("prev");
      } else if (relative === 1) {
        slide.classList.add("next");
      } else {
        slide.classList.add("far");
      }
    });

    whyDots.forEach((dot, index) => {
      dot.classList.toggle("active", index === logicalIndex);
      dot.setAttribute("aria-current", index === logicalIndex ? "true" : "false");
    });
  };

  const setWhyTransform = (index, withTransition = true) => {
    const activeSlide = whyRenderedSlides[index];
    const activeCenter = activeSlide.offsetLeft + activeSlide.offsetWidth / 2;
    const viewportCenter = whyCarousel.clientWidth / 2;
    const offset = activeCenter - viewportCenter;

    if (withTransition) {
      whyTrack.classList.remove("no-motion");
    } else {
      whyTrack.classList.add("no-motion");
    }
    whyTrack.style.transform = `translateX(${-offset}px)`;
  };

  const renderWhyCarousel = () => {
    updateWhyVisualState();
    setWhyTransform(whyIndex);
  };

  const enableWhyAnimation = () => {
    whyCarousel.classList.remove("is-resetting");
    whyTrack.classList.remove("no-motion");
  };

  const disableWhyAnimation = () => {
    whyCarousel.classList.add("is-resetting");
    whyTrack.classList.add("no-motion");
  };

  const scheduleWhyCarousel = () => {
    window.clearTimeout(whyTimer);
    whyTimer = window.setTimeout(() => {
      if (whyLocked) {
        scheduleWhyCarousel();
        return;
      }

      enableWhyAnimation();
      whyLocked = true;
      whyIndex += 1;
      renderWhyCarousel();
    }, 3500);
  };

  const startWhyCarousel = () => {
    scheduleWhyCarousel();
  };

  whyDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (whyLocked) {
        return;
      }

      enableWhyAnimation();
      whyLocked = true;
      whyIndex = whyStartIndex + index;
      renderWhyCarousel();
    });
  });

  whyTrack.addEventListener("transitionend", (event) => {
    if (event.target !== whyTrack || event.propertyName !== "transform") {
      return;
    }

    let resetPerformed = false;

    if (whyIndex >= whyOriginalCount + whyStartIndex) {
      whyIndex -= whyOriginalCount;
      disableWhyAnimation();
      setWhyTransform(whyIndex, false);
      whyTrack.getBoundingClientRect();
      resetPerformed = true;
    } else if (whyIndex < whyStartIndex) {
      whyIndex += whyOriginalCount;
      disableWhyAnimation();
      setWhyTransform(whyIndex, false);
      whyTrack.getBoundingClientRect();
      resetPerformed = true;
    }

    if (resetPerformed) {
      updateWhyVisualState();
    }

    whyLocked = false;
    scheduleWhyCarousel();
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(whyTimer);
    disableWhyAnimation();
    updateWhyVisualState();
    setWhyTransform(whyIndex, false);
    scheduleWhyCarousel();
    setHeaderHeight();
  });
  disableWhyAnimation();
  renderWhyCarousel();
  startWhyCarousel();
}

const testimonials = [
  [
    '"RINL Steel is well-known in our region. The quality is reliable and customers keep coming back because they trust the brand."',
    "[Partner Name]",
    "[Company Name] | [City]",
  ],
  [
    '"The onboarding support helped our team understand products, customer conversations, and operational expectations quickly."',
    "[Partner Name]",
    "[Company Name] | [City]",
  ],
  [
    '"Marketing collateral and stronger brand visibility gave our showroom more credibility from the first month."',
    "[Partner Name]",
    "[Company Name] | [City]",
  ],
];

const quoteCard = document.querySelector("[data-testimonial]");

quoteCard?.querySelectorAll(".dots button").forEach((dot, index) =>
  dot.addEventListener("click", () => {
    const [quote, name, meta] = testimonials[index];
    quoteCard.querySelector(".quote").textContent = quote;
    quoteCard.querySelector("strong").textContent = name;
    quoteCard.querySelector("strong + span").textContent = meta;
    quoteCard.querySelectorAll(".dots button").forEach((item) => item.classList.remove("active"));
    dot.classList.add("active");
  })
);

const productViewer = document.querySelector("[data-product-viewer]");
const productTabs = productViewer ? [...productViewer.querySelectorAll("[data-product-tab]")] : [];
const productPanels = productViewer ? [...productViewer.querySelectorAll("[data-product-panel]")] : [];
const productSelect = productViewer?.querySelector("[data-product-select]");

if (productViewer && productTabs.length && productPanels.length) {
  let activeProductKey = productViewer.querySelector(".product-stage-panel.active")?.getAttribute("data-product-panel") || productPanels[0].getAttribute("data-product-panel");
  let productAnimating = false;

  const setActiveProductTab = (key) => {
    productTabs.forEach((tab) => {
      const active = tab.getAttribute("data-product-tab") === key;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (productSelect) {
      productSelect.value = key;
    }
  };

  const showProductPanel = (key) => {
    if (productAnimating || key === activeProductKey) {
      return;
    }

    const currentPanel = productPanels.find((panel) => panel.getAttribute("data-product-panel") === activeProductKey);
    const nextPanel = productPanels.find((panel) => panel.getAttribute("data-product-panel") === key);

    if (!nextPanel) {
      return;
    }

    productAnimating = true;
    setActiveProductTab(key);

    if (!currentPanel) {
      nextPanel.hidden = false;
      nextPanel.classList.add("active");
      activeProductKey = key;
      productAnimating = false;
      return;
    }

    currentPanel.classList.remove("active");

    window.setTimeout(() => {
      currentPanel.hidden = true;
      nextPanel.hidden = false;
      const nextScroll = nextPanel.querySelector(".product-stage-scroll");
      if (nextScroll) {
        nextScroll.scrollTop = 0;
      }

      requestAnimationFrame(() => {
        nextPanel.classList.add("active");
        activeProductKey = key;
        window.setTimeout(() => {
          productAnimating = false;
        }, 380);
      });
    }, 220);
  };

  setActiveProductTab(activeProductKey);

  productTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      showProductPanel(tab.getAttribute("data-product-tab"));
    });
  });

  productSelect?.addEventListener("change", () => {
    showProductPanel(productSelect.value);
  });
}

const productHeroSlider = document.querySelector("[data-product-hero-slider]");
const productHeroSlides = productHeroSlider ? [...productHeroSlider.querySelectorAll("[data-product-hero-slide]")] : [];
const productCollageItems = [...document.querySelectorAll("[data-product-collage-item]")];

if (productHeroSlider && productHeroSlides.length) {
  const heroTransitionMs = 1350;
  const heroCleanupBufferMs = 120;
  const heroHoldMs = 1200;
  let activeHeroIndex = Math.max(0, productHeroSlides.findIndex((slide) => slide.classList.contains("active")));
  let heroTimer;
  let heroAnimating = false;

  const syncProductCollage = (slideIndex) => {
    productCollageItems.forEach((item) => {
      item.classList.toggle("is-active", item.dataset.productCollageItem === String(slideIndex));
    });
  };

  const setHeroSlide = (nextIndex) => {
    if (heroAnimating || nextIndex === activeHeroIndex) {
      return;
    }

    const current = productHeroSlides[activeHeroIndex];
    const next = productHeroSlides[nextIndex];

    if (!current || !next) {
      return;
    }

    heroAnimating = true;
    current.classList.add("exiting");
    next.classList.add("active", "incoming");
    next.classList.remove("exiting");
    syncProductCollage(nextIndex);

    window.setTimeout(() => {
      current.classList.remove("active", "exiting");
      next.classList.remove("incoming");
      activeHeroIndex = nextIndex;
      heroAnimating = false;
    }, heroTransitionMs + heroCleanupBufferMs);
  };

  const scheduleHeroSlide = () => {
    window.clearTimeout(heroTimer);
    heroTimer = window.setTimeout(() => {
      const nextIndex = (activeHeroIndex + 1) % productHeroSlides.length;
      setHeroSlide(nextIndex);
      scheduleHeroSlide();
    }, heroTransitionMs + heroCleanupBufferMs + heroHoldMs);
  };

  syncProductCollage(activeHeroIndex);
  scheduleHeroSlide();
  window.addEventListener("resize", () => {
    window.clearTimeout(heroTimer);
    scheduleHeroSlide();
  });
}

const serviceCycle = document.querySelector("[data-service-cycle]");
const serviceTabs = serviceCycle ? [...serviceCycle.querySelectorAll("[data-service-tab]")] : [];
const serviceImages = serviceCycle ? [...serviceCycle.querySelectorAll("[data-service-image]")] : [];

if (serviceCycle && serviceTabs.length && serviceImages.length) {
  const setActiveService = (key) => {
    serviceTabs.forEach((tab) => {
      const active = tab.dataset.serviceTab === key;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", active ? "true" : "false");
    });
    serviceImages.forEach((image) => {
      image.classList.toggle("active", image.dataset.serviceImage === key);
    });
  };

  serviceTabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveService(tab.dataset.serviceTab));
  });

  setActiveService(serviceTabs.find((tab) => tab.classList.contains("active"))?.dataset.serviceTab || serviceTabs[0].dataset.serviceTab);
}
