function removeKeywords() {
  // fileKeywords와 customKeywords 모두 가져오기
  chrome.storage.sync.get(
    ["fileKeywords", "customKeywords", "enabled"],
    (result) => {
      // 확장프로그램이 비활성화 상태면 종료
      if (result.enabled === false) return;

      // 두 배열 합치기
      const fileKeywords = result.fileKeywords || [];
      const customKeywords = result.customKeywords || [];
      const keywords = [...new Set([...fileKeywords, ...customKeywords])];

      if (keywords.length === 0) return;

      // TreeWalker를 사용하여 페이지의 모든 텍스트 노드를 순회
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
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
    }
  );
}

// 페이지 로드 시 실행
removeKeywords();

// DOM 변경 감지
const observer = new MutationObserver(() => {
  removeKeywords();
});

// document.body의 모든 변경사항을 관찰
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
