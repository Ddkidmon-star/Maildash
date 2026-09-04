const fs = require('fs');

let gen = fs.readFileSync('src/components/GeneratorScreen.tsx', 'utf8');

// replace the first chunk with only one email
const findStr = `export default function GeneratorScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [email, setEmail] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);

  const [activeAccount, setActiveAccount] = useState<any | null>(null);
  const [email, setEmail] = useState<string>('');`;

const replStr = `export default function GeneratorScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const [activeAccount, setActiveAccount] = useState<any | null>(null);
  const [email, setEmail] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);`;

gen = gen.replace(findStr, replStr);

fs.writeFileSync('src/components/GeneratorScreen.tsx', gen);
