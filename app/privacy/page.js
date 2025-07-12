import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Database, Lock, AlertTriangle } from "lucide-react"

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-950 text-white font-outfit min-h-screen">
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-400" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p>
                  Welcome to fuelmywork. We respect your privacy and are committed to protecting your personal data.
                  This privacy policy explains how we collect, use, and safeguard your information when you use our
                  platform.
                </p>
                <p>
                  fuelmywork is a platform that connects creators with supporters. We facilitate payments between
                  supporters and creators but do not handle the funds directly - all payments are processed securely
                  through Razorpay.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-400" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Account Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>GitHub profile information (name, email, profile picture) when you sign in</li>
                    <li>Username and display name you choose for your creator profile</li>
                    <li>Bio and profile images you upload</li>
                    <li>Payment credentials (Razorpay keys) - encrypted and stored securely</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Usage Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Pages you visit and features you use</li>
                    <li>Search queries and interactions with creator profiles</li>
                    <li>Device information and browser type</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Payment Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Support transaction details (amount, supporter name, messages)</li>
                    <li>Payment processing is handled entirely by Razorpay - we do not store payment card details</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>To provide and maintain our platform services</li>
                  <li>To authenticate users and manage accounts</li>
                  <li>To facilitate connections between creators and supporters</li>
                  <li>To process and display support transactions</li>
                  <li>To improve our platform and user experience</li>
                  <li>To communicate important updates about our service</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Payment Processing Disclaimer */}
            <Card className="bg-yellow-900/20 border-yellow-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Important Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-200 space-y-4">
                <div>
                  <h4 className="text-yellow-300 font-semibold mb-2">Payment Processing</h4>
                  <p className="text-sm">
                    All payments on fuelmywork are processed directly through Razorpay's secure payment gateway. We do
                    not receive, hold, or handle any funds. Money goes directly from supporters to creators' bank
                    accounts through Razorpay.
                  </p>
                </div>
                <div>
                  <h4 className="text-yellow-300 font-semibold mb-2">Refunds and Cancellations</h4>
                  <p className="text-sm">
                    Since we do not handle payments directly, we cannot guarantee refunds or cancellations. If a payment
                    is not received by a creator, this is typically a banking or payment gateway issue. In such cases,
                    refunds will be processed automatically by your bank or Razorpay. Please contact your bank or
                    Razorpay support for payment-related issues.
                  </p>
                </div>
                <div>
                  <h4 className="text-yellow-300 font-semibold mb-2">Our Role</h4>
                  <p className="text-sm">
                    fuelmywork acts as a platform to connect creators and supporters. We facilitate the connection but
                    are not responsible for payment processing, delivery of creator content, or resolution of disputes
                    between creators and supporters.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Data Security</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All sensitive data is encrypted using industry-standard encryption</li>
                  <li>Razorpay credentials are encrypted before storage</li>
                  <li>Secure HTTPS connections for all data transmission</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Withdraw consent for data processing</li>
                  <li>File a complaint with data protection authorities</li>
                </ul>
              </CardContent>
            </Card>

            {/* Third-Party Services */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">GitHub OAuth</h4>
                  <p className="text-sm">
                    We use GitHub OAuth for authentication. Please review GitHub's privacy policy for information about
                    how they handle your data.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Razorpay</h4>
                  <p className="text-sm">
                    All payment processing is handled by Razorpay. Please review Razorpay's privacy policy and terms of
                    service for information about payment data handling.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="text-sm">
                  <p>Email: moxitrewar777@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Policy Updates</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this
                  Privacy Policy periodically for any changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
