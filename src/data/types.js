export default {
  "types": [
    "Solidity",
    "Rust",
    "Move",
    "JS",
    "Python",
    "ZK",
    "DeFi",
    "NFT",
    "Consensus",
    "Governance",
    "Security",
    "Meme"
  ],
  "colors": {
    "Solidity": "#6b6b9b",
    "Rust": "#c0552b",
    "Move": "#3a8eb8",
    "JS": "#e6c84a",
    "Python": "#4a7ec8",
    "ZK": "#9e5cc0",
    "DeFi": "#3ab86b",
    "NFT": "#e060a4",
    "Consensus": "#c0c0c0",
    "Governance": "#7a5238",
    "Security": "#b03030",
    "Meme": "#f08a4a"
  },
  "chart": {
    "Solidity":   { "JS": 2.0, "Security": 0.5, "Rust": 0.5 },
    "Rust":       { "Solidity": 2.0, "JS": 2.0, "Security": 2.0, "Move": 0.5 },
    "Move":       { "Solidity": 2.0, "Rust": 2.0, "Consensus": 0.5 },
    "JS":         { "NFT": 2.0, "DeFi": 1.5, "Rust": 0.5, "Security": 0.5 },
    "Python":     { "ZK": 2.0, "DeFi": 1.5, "Consensus": 0.5 },
    "ZK":         { "Security": 2.0, "Governance": 2.0, "Meme": 0.5 },
    "DeFi":       { "NFT": 2.0, "Governance": 2.0, "Security": 0.5, "Consensus": 0.5 },
    "NFT":        { "Meme": 2.0, "DeFi": 0.5, "Security": 0.5 },
    "Consensus":  { "DeFi": 2.0, "Governance": 2.0, "ZK": 0.5 },
    "Governance": { "Consensus": 0.5, "Security": 1.5, "Meme": 0.5 },
    "Security":   { "Solidity": 2.0, "NFT": 2.0, "Rust": 0.5, "ZK": 0.5 },
    "Meme":       { "Governance": 2.0, "DeFi": 1.5, "Security": 0.5, "NFT": 0.5 }
  }
}
;
