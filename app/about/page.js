import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Shield, CreditCard, Users, HelpCircle } from "lucide-react"
import Link from "next/link"

const AboutUs = () => {
  const faqs = [
    {
      question: "How do payments work on fuelmywork?",
      answer:
        "We use Razorpay, India's most trusted payment gateway, to process all transactions securely. Supporters can pay using UPI, cards, net banking, and wallets. All payments are encrypted and PCI DSS compliant.",
    },
    {
      question: "Is it safe to make payments through fuelmywork?",
      answer:
        "We use Razorpay's secure payment infrastructure with bank-level security. Your financial information is never stored on our servers and all transactions are protected by advanced fraud detection.",
    },
    {
      question: "What payment methods are supported?",
      answer:
        "Through Razorpay integration, we support UPI (Google Pay, PhonePe, Paytm), all major credit/debit cards, net banking from 50+ banks, and popular wallets like Paytm, Mobikwik, and Amazon Pay.",
    },
    {
      question: "How do creators receive their money?",
      answer:
        "Creators receive payments directly to their bank account through Razorpay's instant settlement feature. Funds are typically available within 24 hours of the transaction.",
    },
    {
      question: "Are there any fees for supporters?",
      answer:
        "Supporters don't pay any additional fees. The payment processing fees are handled transparently through Razorpay's competitive rates.",
    },
    {
      question: "Can I get a refund if needed?",
      answer:
        "Refunds are processed through Razorpay's secure refund system. Contact our support team with your transaction details, and we'll help you with the refund process as per our refund policy.",
    },
  ]

  return (
    <div className="bg-gray-950 text-white font-outfit">
      {/* Hero Section */}
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            About fuelmywork
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Connecting creators with supporters who believe in their work and want to fuel their passion.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-white text-lg sm:text-xl">For Creators</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  Empowering creators to focus on their passion while building sustainable income streams.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-white text-lg sm:text-xl">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  Built with Razorpay integration ensuring safe, fast, and reliable payment processing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-white text-lg sm:text-xl">Easy Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  Simple and intuitive platform for supporters to discover and fund their favorite creators.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Developer Section */}
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Meet the Developer</h2>
          <div className="bg-gray-800/50 rounded-lg p-6 sm:p-8 border border-gray-700">
            <p className="text-2xl text-white mb-2 mx-auto max-w-2xl">Hi, I'm Moxit — the developer behind fuelmywork.</p>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              I created this platform to bridge the gap between creators and their supporters, 
              making it simple for talented individuals to monetize their passion and for fans to directly contribute to the work they love. 
              With secure Razorpay integration and a strong focus on user experience, 
              FuelMyWork is built to be India's go-to platform for creator support.
            </p>
            <Link href="https://moxitrewar.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                Visit My Portfolio
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Everything you need to know about payments and how fuelmywork works
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-base sm:text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
            Join thousands of creators and supporters on fuelmywork today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                Start Creating
              </Button>
            </Link>
            <Link href="/">
              <Button
                href="/"
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent w-full sm:w-auto"
              >
                Find Creators
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
