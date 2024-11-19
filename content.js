function removeKeywords() {
  // fileKeywords와 customKeywords 모두 가져오기
  chrome.storage.sync.get(
    ["fileKeywords", "customKeywords", "enabled"],
    (result) => {
      // 확장프로그램이 비활성화 상태면 종료
      if (result.enabled === false) return;

      // 두 배열 합치기
      const keywords = [
        ...new Set([
          ...(result.fileKeywords || []),
          ...(result.customKeywords || []),
        ]),
      ];

      if (keywords.length === 0) return;

      requestAnimationFrame(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              return node.nodeValue.trim() &&
                keywords.some((k) => node.nodeValue.includes(k))
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
            },
          }
        );

        let node;
        while ((node = walker.nextNode())) {
          let text = node.nodeValue;
          keywords.forEach((keyword) => {
            text = text.replaceAll(keyword, "");
          });
          if (text !== node.nodeValue) {
            node.nodeValue = text;
          }
        }
      });
    }
  );
}

const debouncedRemove = debounce(removeKeywords, 100);

const observer = new MutationObserver((mutations) => {
  if (
    mutations.some((m) => m.addedNodes.length || m.type === "characterData")
  ) {
    debouncedRemove();
  }
});

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});

removeKeywords();
