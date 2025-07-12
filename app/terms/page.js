import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, Users, Shield, Gavel } from "lucide-react"

const TermsOfService = () => {
  return (
    <div className="bg-gray-950 text-white font-outfit min-h-screen">
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">
                  Welcome to fuelmywork. These Terms of Service ("Terms") govern your use of our platform and services.
                  By accessing or using fuelmywork, you agree to be bound by these Terms. If you disagree with any part
                  of these terms, then you may not access the service.
                </p>
                <p className="text-sm">
                  fuelmywork is a platform that connects creators with supporters who want to provide financial support.
                  We facilitate these connections but do not handle payments directly - all transactions are processed
                  through Razorpay's secure payment gateway.
                </p>
              </CardContent>
            </Card>

            {/* Platform Description */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Platform Description
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">For Creators</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Create a profile to showcase your work and connect with supporters</li>
                    <li>Set up Razorpay payment integration to receive direct payments</li>
                    <li>Manage your supporter community and interactions</li>
                    <li>You are responsible for your content and supporter relationships</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">For Supporters</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Discover and search for creators to support</li>
                    <li>Make secure payments directly to creators through Razorpay</li>
                    <li>Leave messages and interact with creators</li>
                    <li>Support is voluntary and at your own discretion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms - Critical Section */}
            <Card className="bg-red-900/20 border-red-700">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Important Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-red-200 space-y-4">
                <div>
                  <h4 className="text-red-300 font-semibold mb-2">Payment Processing</h4>
                  <p className="text-sm">
                    <strong>fuelmywork does NOT receive, hold, or process any payments.</strong> All payments are
                    processed directly through Razorpay's payment gateway and go directly from supporters to creators'
                    bank accounts. We are not a payment processor or financial institution.
                  </p>
                </div>
                <div>
                  <h4 className="text-red-300 font-semibold mb-2">No Guarantee of Payment Delivery</h4>
                  <p className="text-sm">
                    We cannot guarantee that payments will be successfully delivered to creators. Payment success
                    depends on various factors including bank processing, Razorpay's systems, and account
                    configurations. fuelmywork is not responsible for failed, delayed, or incomplete payments.
                  </p>
                </div>
                <div>
                  <h4 className="text-red-300 font-semibold mb-2">Refunds and Cancellations</h4>
                  <p className="text-sm">
                    <strong>fuelmywork cannot process refunds or cancellations</strong> because we do not handle
                    payments. If a payment fails or is not received by a creator, this is typically due to banking or
                    payment gateway issues. In such cases:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Refunds will be processed automatically by your bank or Razorpay</li>
                    <li>Contact your bank first for payment-related issues</li>
                    <li>Contact Razorpay support for payment gateway issues</li>
                    <li>We can provide transaction details but cannot initiate refunds</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-300 font-semibold mb-2">Dispute Resolution</h4>
                  <p className="text-sm">
                    Disputes between supporters and creators regarding payments, content, or services must be resolved
                    directly between the parties involved. fuelmywork is not responsible for mediating or resolving such
                    disputes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">All Users</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Provide accurate and truthful information</li>
                    <li>Maintain the security of your account</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Respect other users and maintain appropriate conduct</li>
                    <li>Not use the platform for illegal or harmful activities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Creators</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Ensure your Razorpay account is properly configured</li>
                    <li>Provide accurate payment information</li>
                    <li>Be transparent about your work and goals</li>
                    <li>Respond to supporters in a timely and professional manner</li>
                    <li>Comply with tax obligations in your jurisdiction</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Supporters</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Understand that support is voluntary and non-refundable through our platform</li>
                    <li>Verify creator information before making payments</li>
                    <li>Use secure payment methods and protect your financial information</li>
                    <li>Contact appropriate parties (bank/Razorpay) for payment issues</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Prohibited Activities</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">The following activities are strictly prohibited:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Fraudulent or deceptive practices</li>
                  <li>Money laundering or illegal financial activities</li>
                  <li>Harassment, abuse, or inappropriate behavior</li>
                  <li>Spam, phishing, or malicious activities</li>
                  <li>Violation of intellectual property rights</li>
                  <li>Creating fake profiles or impersonating others</li>
                  <li>Attempting to circumvent platform security measures</li>
                  <li>Using the platform for illegal content or services</li>
                </ul>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="bg-yellow-900/20 border-yellow-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-200 space-y-4">
                <p className="text-sm">
                  <strong>fuelmywork provides the platform "as is" without warranties of any kind.</strong>
                  To the maximum extent permitted by law, we disclaim all liability for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Failed, delayed, or incomplete payment transactions</li>
                  <li>Disputes between creators and supporters</li>
                  <li>Content provided by creators or supporters</li>
                  <li>Third-party services (GitHub, Razorpay) functionality</li>
                  <li>Loss of data or service interruptions</li>
                  <li>Any indirect, incidental, or consequential damages</li>
                </ul>
                <p className="text-sm">
                  Our total liability for any claims related to the service shall not exceed the amount you paid to us
                  (if any) in the 12 months preceding the claim.
                </p>
              </CardContent>
            </Card>

            {/* Account Termination */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Termination</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">
                  We reserve the right to suspend or terminate accounts that violate these Terms. You may also delete
                  your account at any time. Upon termination:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your profile and data will be removed from our platform</li>
                  <li>Ongoing payment relationships with Razorpay are not affected</li>
                  <li>You remain responsible for any outstanding obligations</li>
                  <li>These Terms continue to apply to past use of the service</li>
                </ul>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">
                  We may modify these Terms at any time. We will notify users of significant changes by posting the
                  updated Terms on our platform and updating the "Last updated" date. Continued use of the service after
                  changes constitutes acceptance of the new Terms.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">
                  These Terms are governed by the laws of India. Any disputes arising from these Terms or use of the
                  service shall be subject to the jurisdiction of Indian courts.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <p className="text-sm">If you have any questions about these Terms of Service, please contact us at:</p>
                <div className="text-sm">
                  <p>Email: moxitrewar777@gmail.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
