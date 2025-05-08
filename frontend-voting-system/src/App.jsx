import { useState, useRef, useEffect } from "react";
import { BrowserProvider, ethers } from "ethers";
import CONTRACT_ABI from "../../backend/artifacts/contracts/Voting.sol/Voting.json";
import logo from "./assets/logo1.svg";
import Loading from "./components/Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [formData, setFormData] = useState({
    porposalTitle: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
  });

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT;
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [proposalData, setProposalData] = useState(null);
  const [votedName, setVotedName] = useState();
  const [isVoted, setIsVoted] = useState(false);
  const [totalVote, setTotalVote] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingforVote, setIsLoadingforVote] = useState(false);
  const [winner, setWinner] = useState();
  const [winnerVoteCount, setWinnerVoteCount] = useState();

  const porposalDetail = useRef([]);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!contract) return;
      try {
        const proposal = await contract.getProposal();
        setProposalData(proposal);
      } catch (error) {
        console.error("Error fetching proposal:", error);
      }
    };

    const checkVoted = async () => {
      if (!contract) return;
      try {
        const isvoted = await contract.isVoted(walletAddress);
        setIsVoted(isvoted);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchProposal();
    checkVoted();
  }, [contract, isVoted]);

  useEffect(() => {
    const getTotalVote = async () => {
      const totalVote = await contract.voteCount();
      setTotalVote(totalVote);
    };
    getTotalVote();

    const getWinner = async () => {
      const winner = await contract.getWinner();
      setWinner(winner[0]);
      setWinnerVoteCount(winner[1]);
    };
    getWinner();
  }, [walletAddress, contract, proposalData]);

  useEffect(() => {
    const fetchVotedOption = async () => {
      if (contract && walletAddress) {
        try {
          const option = await contract.votedOption(walletAddress);
          setVotedName(option);
        } catch (error) {
          toast.error("Error fetching voted option");
        }
      }
    };
    fetchVotedOption();
  }, [contract, walletAddress, proposalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConnect = async () => {
    if (walletAddress) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI.abi,
        signer
      );
      setSigner(signer);
      setWalletAddress(address);
      setContract(contractInstance);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  const submitPorposal = async (e) => {
    e.preventDefault();

    const { porposalTitle, option1, option2, option3, option4 } = formData;
    if (!porposalTitle || !option1 || !option2 || !option3 || !option4) {
      toast.error("Please fill in all fields before creating proposal.");
      return;
    }

    porposalDetail.current.push({ ...formData });

    try {
      setIsLoading(true);
      const tx = await contract.createProposal(
        porposalTitle,
        option1,
        option2,
        option3,
        option4
      );
      await tx.wait();
      toast.success("Proposal successfully submitted!");

      const proposal = await contract.getProposal();
      setProposalData(proposal);
      const isvoted = await contract.isVoted(walletAddress);
      setIsVoted(isvoted);
    } catch (err) {
      toast.error("Transaction failed");
    } finally {
      setIsLoading(false);
    }

    setFormData({
      porposalTitle: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
    });
  };

  return (
    <>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderRadius: "0 0 12px 12px",
          background: "linear-gradient(to right, #74ebd5, #acb6e5)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontWeight: "600",
          fontSize: "20px",
          color: "#fff",
        }}
      >
        <img src={logo} alt="Logo" style={{ width: 60 }} />
        <h1 style={{ textAlign: "center", flex: 1 }}>
          Decentralized Voting System
        </h1>
        <button
          onClick={handleConnect}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1e40af",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {walletAddress ? `Wallet: ${walletAddress}` : "Connect Wallet"}
        </button>
      </header>

      {/* Proposal Form */}
      <main
        style={{ maxWidth: "600px", margin: "30px auto", textAlign: "center" }}
      >
        <form
          onSubmit={submitPorposal}
          style={{
            backgroundColor: "#f1f5f9",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Create Proposal</h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Only the contract owner can create a proposal.
          </p>
          <input
            type="text"
            name="porposalTitle"
            value={formData.porposalTitle}
            onChange={handleChange}
            placeholder="Proposal Title"
            style={inputStyle}
          />
          {["option1", "option2", "option3", "option4"].map((opt, idx) => (
            <input
              key={opt}
              name={opt}
              value={formData[opt]}
              onChange={handleChange}
              placeholder={`Option ${idx + 1}`}
              style={inputStyle}
            />
          ))}
          <button
            type="submit"
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Loading
              isLoading={isLoading}
              processing={"Submitting proposal..."}
              neutral={"Create Proposal"}
            />
          </button>
        </form>
      </main>

      <div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      >
        {/* Voting Details */}
        <section style={cardStyle}>
          <h3>Voting Details</h3>
          <p>
            <strong>Total Votes:</strong> {totalVote}
          </p>
          <p>
            <strong>Your Voted Option:</strong> {votedName || "Not voted yet"}
          </p>
          <p>
            <strong>Voted?</strong> {isVoted ? "Yes" : "No"}
          </p>
          <p>
            <strong>Winner:</strong> {winner}
          </p>
          <p>
            <strong>Winner Vote Count:</strong> {winnerVoteCount}
          </p>
        </section>

        {/* Active Proposal */}
        {proposalData && (
          <section style={cardStyle}>
            <h3>Active Proposal</h3>
            <h4>{proposalData[0]}</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {proposalData.slice(1).map((opt, i) => (
                <li key={i} style={{ margin: "10px 0" }}>
                  {opt}
                  {!isVoted && opt && (
                    <button
                      style={{
                        marginLeft: "15px",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        try {
                          setIsLoadingforVote(true);
                          const tx = await contract.vote(opt);
                          await tx.wait();
                          setIsVoted(true);
                          toast.success(`Voted successfully for "${opt}"`);
                        } catch (error) {
                          toast.error("Voting failed. Maybe already voted?");
                        } finally {
                          setIsLoadingforVote(false);
                        }
                      }}
                    >
                      Vote
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <Loading isLoading={isLoadingforVote} processing={"Voting..."} />
          </section>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const cardStyle = {
  backgroundColor: "#f8fafc",
  padding: "25px",
  margin: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  maxWidth: "400px",
  width: "100%",
};

export default App;
