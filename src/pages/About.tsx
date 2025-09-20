import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { GraduationCap, Users, MessageCircle, TrendingUp } from "lucide-react";
import PixelBlast from '@/components/PixelBlast';
import ScrambledText from '@/components/ScrambledText';

const About = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "Alumni Expertise",
      description: "Learn from graduates working at top companies worldwide"
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with peers and build lasting professional relationships"
    },
    {
      icon: MessageCircle,
      title: "Knowledge Sharing",
      description: "Share insights, ask questions, and grow together"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Get mentorship and advice for your professional journey"
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* PixelBlast Background */}
      <div className="fixed inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar />
      
        {/* About Hero Section */}
        <div className="pt-20 pb-16 px-4 bg-gradient-to-br from-purple-900/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About <span className="text-purple-400">GradNet</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              <ScrambledText
                className="scrambled-text-demo"
                radius={80}
                duration={1.0}
                speed={0.4}
                scrambleChars=".:"
              >
                GradNet is the premier professional networking platform designed specifically for students and alumni. 
                We bridge the gap between academic learning and professional success, creating meaningful connections 
                that last a lifetime.
              </ScrambledText>
            </p>
          </div>
        </div>      {/* Mission Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-white/80 mb-4">
                We believe that the most powerful learning happens through human connections. 
                GradNet empowers students to learn from those who have walked the path before them, 
                while giving alumni a platform to share their knowledge and give back to their community.
              </p>
              <p className="text-lg text-white/80">
                Our platform fosters an environment where knowledge flows freely, relationships are built 
                authentically, and career growth is accelerated through mentorship and peer support.
              </p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-8 border border-purple-500/20">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">10,000+</div>
                <div className="text-white/80 mb-4">Active Members</div>
                <div className="text-4xl font-bold text-purple-400 mb-2">500+</div>
                <div className="text-white/80 mb-4">Companies Represented</div>
                <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
                <div className="text-white/80">Countries Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Features Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Choose GradNet?
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Join thousands of students and alumni building meaningful professional connections
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10 text-center animate-fade-in backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/80">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>      {/* Values Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Values
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Community First
              </h3>
              <p className="text-white/80">
                We prioritize building genuine relationships and fostering a supportive community 
                where everyone can thrive and grow together.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Knowledge Sharing
              </h3>
              <p className="text-white/80">
                We believe knowledge grows when shared. Our platform encourages open dialogue, 
                mentorship, and collaborative learning experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Growth Mindset
              </h3>
              <p className="text-white/80">
                We embrace continuous learning and improvement, helping our members develop 
                both personally and professionally throughout their careers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Built by Students, for Students
          </h2>
          <p className="text-lg text-white/80 mb-8">
            GradNet was founded by a team of students who experienced firsthand the challenges 
            of transitioning from academic life to professional careers. We understand the importance 
            of having the right connections and mentorship to succeed.
          </p>
          <p className="text-lg text-white/80">
            Today, we're proud to serve a global community of learners, mentors, and professionals 
            who are committed to helping each other succeed.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default About;