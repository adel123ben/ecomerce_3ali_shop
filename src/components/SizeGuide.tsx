import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuide: React.FC<SizeGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sizeChart = [
    { size: 'XS', chest: '32-34', waist: '26-28', hips: '34-36' },
    { size: 'S', chest: '34-36', waist: '28-30', hips: '36-38' },
    { size: 'M', chest: '36-38', waist: '30-32', hips: '38-40' },
    { size: 'L', chest: '38-40', waist: '32-34', hips: '40-42' },
    { size: 'XL', chest: '40-42', waist: '34-36', hips: '42-44' },
    { size: 'XXL', chest: '42-44', waist: '36-38', hips: '44-46' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Ruler className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Size Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Measure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Chest</h4>
                  <p className="text-gray-600">Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Waist</h4>
                  <p className="text-gray-600">Measure around your natural waistline, keeping the tape comfortably loose.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Hips</h4>
                  <p className="text-gray-600">Measure around the fullest part of your hips, keeping the tape horizontal.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Size Chart (inches)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Chest
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Waist
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Hips
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {sizeChart.map((row, index) => (
                      <tr key={row.size} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                          {row.size}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                          {row.chest}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                          {row.waist}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">
                          {row.hips}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Fit Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• For a relaxed fit, choose one size up</li>
                <li>• Athletic fit runs true to size</li>
                <li>• If between sizes, size up for comfort</li>
                <li>• Check product-specific fit notes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};