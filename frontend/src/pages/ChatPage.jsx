// ChatPage.jsx
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat'; // your actual chat logic component

export default function ChatPage() {
    const { username } = useParams();
    console.log('Username from useParams in ChatPage:', username);

    return (
        <div className="p-4">
            <Chat otherUsername={username} />
        </div>
    );
}
