import { MessageCircle, Mail, ExternalLink } from 'lucide-react';

export default function ChatWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-[100] group">
      <div className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 scale-0 group-hover:scale-100 transition-all origin-bottom-right duration-300 opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Need Help?</p>
            <p className="text-[10px] text-gray-500 font-medium">Contact our support team</p>
          </div>
        </div>

        <div className="space-y-2">
          <a href="mailto:info@shopwice.com" className="flex items-center justify-between p-2 hover:bg-indigo-50 rounded-xl transition-colors group/link">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 group-hover/link:text-indigo-600" />
              <span className="text-xs font-bold text-gray-600">Email Support</span>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-300" />
          </a>

          <a href="https://wa.me/233544198224" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 hover:bg-green-50 rounded-xl transition-colors group/link">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-400 group-hover/link:text-green-600" />
              <span className="text-xs font-bold text-gray-600">WhatsApp Us</span>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-300" />
          </a>
        </div>
      </div>

      <button className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 shadow-indigo-200">
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
}
