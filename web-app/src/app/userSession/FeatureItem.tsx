const FeatureItem = ({ icon, title, children }: { 
  icon: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <span className="text-2xl">{icon}</span>
    <div>
      <h4 className="font-medium text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{children}</p>
    </div>
  </div>
);

export default FeatureItem;