const fs = require('fs');
let nav = fs.readFileSync('src/components/Navigation.tsx', 'utf8');

const importStr = `import { Home, Settings, Zap, PlusCircle, MessageSquare, Mail, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../lib/userUtils';`;
nav = nav.replace("import { Home, Settings, Zap, PlusCircle, MessageSquare, Mail } from 'lucide-react';", importStr);

const propsStr = `interface NavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  userProfile?: UserProfile | null;
}`;
nav = nav.replace(/interface NavProps \{[\s\S]*?\}/, propsStr);

// add to BottomNav
nav = nav.replace("export function BottomNav({ activeTab, onTabChange }: NavProps) {", "export function BottomNav({ activeTab, onTabChange, userProfile }: NavProps) {");
const btmAdmin = `{userProfile?.role === 'owner' && <NavItem icon={ShieldAlert} label="Admin" isActive={activeTab === 'admin'} onClick={() => onTabChange('admin')} />}`;
nav = nav.replace("<NavItem icon={Settings} label=\"Settings\"", btmAdmin + "\n      <NavItem icon={Settings} label=\"Settings\"");

// add to SideNav
nav = nav.replace("export function SideNav({ activeTab, onTabChange }: NavProps) {", "export function SideNav({ activeTab, onTabChange, userProfile }: NavProps) {");
const sideAdmin = `{userProfile?.role === 'owner' && <SideNavItem icon={ShieldAlert} label="Admin" isActive={activeTab === 'admin'} onClick={() => onTabChange('admin')} />}`;
nav = nav.replace("<SideNavItem icon={Settings} label=\"Settings\"", sideAdmin + "\n        <SideNavItem icon={Settings} label=\"Settings\"");

const ownerTag = `
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-black dark:text-white truncate">{user.displayName || 'User'}</p>
              {userProfile?.role === 'owner' && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Owner</span>}
            </div>
`;
nav = nav.replace("<p className=\"text-sm font-semibold text-black dark:text-white truncate\">{user.displayName || 'User'}</p>", ownerTag);

fs.writeFileSync('src/components/Navigation.tsx', nav);
