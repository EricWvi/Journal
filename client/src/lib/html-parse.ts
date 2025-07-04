export interface Node {
  type: NodeType;
  content?: string;
  style?: TextStyle;
}

class TextStyle {
  constructor(private value: number) {}

  toString(): string {
    if (this.value === 0) {
      return "Normal";
    } else {
      const styles: string[] = [];
      if (this.value & Style.BOLD) styles.push("b");
      if (this.value & Style.ITALIC) styles.push("i");
      if (this.value & Style.UNDERLINE) styles.push("u");
      if (this.value & Style.MARK) styles.push("m");
      if (this.value & Style.STRIKETHROUGH) styles.push("s");
      return styles.join(" | ");
    }
  }

  getValue(): number {
    return this.value;
  }
}

// style bit map
export const Style = {
  NORMAL: 0,
  BOLD: 1 << 0,
  ITALIC: 1 << 1,
  UNDERLINE: 1 << 2,
  MARK: 1 << 3,
  STRIKETHROUGH: 1 << 4,
};

export enum NodeType {
  IMAGE = "image",
  BREAK = "break",
  TEXT = "text",
  EMOJI = "emoji",
}

const getInlineStyle = (node: HTMLElement): [number, boolean] => {
  let style = Style.NORMAL;
  let isUnBold = false;
  const computed = window.getComputedStyle(node);

  if (
    computed.fontWeight === "bold" ||
    computed.fontWeight === "bolder" ||
    parseInt(computed.fontWeight, 10) >= 500
  ) {
    style |= Style.BOLD;
  }
  if (computed.fontStyle === "italic" || computed.fontStyle === "oblique") {
    style |= Style.ITALIC;
  }
  if (computed.textDecorationLine.includes("underline")) {
    style |= Style.UNDERLINE;
  }
  if (computed.textDecorationLine.includes("line-through")) {
    style |= Style.STRIKETHROUGH;
  }
  if (parseInt(computed.fontWeight, 10) <= 400) {
    isUnBold = true;
  }
  return [style, isUnBold];
};

export const dumpHtmlNodes = (nodes: NodeListOf<ChildNode>): Node[] => {
  const traverse = (node: ChildNode, style: number, l: Node[]) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const [computedStyle, isUnBold] = getInlineStyle(element);
      style = style | computedStyle;
      if (isUnBold) {
        style &= ~Style.BOLD;
      }
      if (element.tagName === "IMG") {
        if (customNodes.length === 0) {
          customNodes.push({ type: NodeType.BREAK });
        }
        const src = (element as HTMLImageElement).src;
        const link = src.substring(src.lastIndexOf("/") + 1);
        customNodes.push({
          type: NodeType.IMAGE,
          content: link,
        });
      } else if (element.tagName === "BR") {
        customNodes.push({ type: NodeType.BREAK });
      } else if (element.tagName === "SPAN") {
        if (element.classList.contains("wechat-emoji")) {
          customNodes.push({
            type: NodeType.EMOJI,
            content: element.getAttribute("data-emoji-id") || "",
          });
        } else {
          node.childNodes.forEach((n) => {
            traverse(n, style, customNodes);
          });
        }
      } else if (element.tagName === "DIV") {
        if (
          customNodes.length > 0 &&
          customNodes[customNodes.length - 1].type === NodeType.TEXT
        ) {
          customNodes.push({ type: NodeType.BREAK });
        }
        node.childNodes.forEach((n) => {
          traverse(n, style, customNodes);
        });
        customNodes.push({ type: NodeType.BREAK });
      } else if (element.tagName === "B") {
        node.childNodes.forEach((n) => {
          traverse(n, style | Style.BOLD, customNodes);
        });
      } else if (element.tagName === "I") {
        node.childNodes.forEach((n) => {
          traverse(n, style | Style.ITALIC, customNodes);
        });
      } else if (element.tagName === "U") {
        node.childNodes.forEach((n) => {
          traverse(n, style | Style.UNDERLINE, customNodes);
        });
      } else if (element.tagName === "MARK") {
        node.childNodes.forEach((n) => {
          traverse(n, style | Style.MARK, customNodes);
        });
      } else if (element.tagName === "STRIKE") {
        node.childNodes.forEach((n) => {
          traverse(n, style | Style.STRIKETHROUGH, customNodes);
        });
      } else {
        alert("Unsupported tag name: " + element.tagName);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && node.textContent.trim() !== "") {
        customNodes.push({
          type: NodeType.TEXT,
          content: node.textContent,
          style: new TextStyle(style),
        });
      }
    } else {
      alert("Unsupported node type: " + node.nodeType);
    }
  };

  let customNodes: Node[] = [];
  nodes.forEach((node) => {
    traverse(node, Style.NORMAL, customNodes);
  });
  return customNodes;
};
