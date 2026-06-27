// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Y8 Proof of Entropy
/// @notice ERC-721 NFT minted from device telemetry entropy. Each token proves
///         a unique entropy contribution from a real device at a point in time.
contract Y8ProofOfEntropy {
    // ── ERC-721 storage ─────────────────────────────────────────────────────
    string public name   = "Y8 Proof of Entropy";
    string public symbol = "Y8POE";

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    uint256 private _nextTokenId;

    // ── Entropy storage ─────────────────────────────────────────────────────
    struct Proof {
        bytes32 entropyHash;  // SHA-256 of collected telemetry
        uint256 timestamp;
        address minter;
        string  deviceType;   // 'mobile' | 'desktop' | 'tablet'
        uint256 score;        // 0-100 quality score
        bool    gps;          // GPS contributed
        bool    motion;       // Accelerometer/gyro contributed
        bool    network;      // Network info contributed
    }

    mapping(uint256 => Proof)    public proofs;
    mapping(address => uint256[]) public userProofs;
    mapping(bytes32 => bool)     public usedHashes; // replay protection

    // ── Events ──────────────────────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event ProofMinted(
        uint256 indexed tokenId,
        address indexed minter,
        bytes32         entropyHash,
        uint256         score
    );

    // ── Mint ────────────────────────────────────────────────────────────────
    function mintProof(
        bytes32 entropyHash,
        string calldata deviceType,
        uint256 score,
        bool gps,
        bool motion,
        bool network
    ) external returns (uint256 tokenId) {
        require(!usedHashes[entropyHash], "Y8POE: entropy hash already used");
        require(score > 0 && score <= 100, "Y8POE: score out of range");

        usedHashes[entropyHash] = true;
        tokenId = _nextTokenId++;

        _owners[tokenId]       = msg.sender;
        _balances[msg.sender] += 1;

        proofs[tokenId] = Proof({
            entropyHash: entropyHash,
            timestamp:   block.timestamp,
            minter:      msg.sender,
            deviceType:  deviceType,
            score:       score,
            gps:         gps,
            motion:      motion,
            network:     network
        });

        userProofs[msg.sender].push(tokenId);

        emit Transfer(address(0), msg.sender, tokenId);
        emit ProofMinted(tokenId, msg.sender, entropyHash, score);
    }

    // ── ERC-721 read ────────────────────────────────────────────────────────
    function balanceOf(address owner)         external view returns (uint256) { return _balances[owner]; }
    function ownerOf(uint256 tokenId)         external view returns (address) { return _owners[tokenId]; }
    function totalSupply()                    external view returns (uint256) { return _nextTokenId; }
    function getUserProofs(address user)      external view returns (uint256[] memory) { return userProofs[user]; }
}
