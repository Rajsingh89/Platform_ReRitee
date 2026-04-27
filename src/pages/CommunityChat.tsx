import { useNavigate } from "react-router-dom";
import { ChatRoom } from "../components/chat/ChatRoom";

export const CommunityChat = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-universe-900 text-universe-foreground overflow-hidden">
      <ChatRoom
        isOpen
        onClose={() => navigate("/dashboard")}
        isExpanded
        showBackButton
        backLabel="Back to Dashboard"
        onBack={() => navigate("/dashboard")}
      />
    </div>
  );
};
