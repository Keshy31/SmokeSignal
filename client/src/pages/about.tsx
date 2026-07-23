import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoIcon,
  MapPinIcon,
  BellIcon,
  FlameIcon,
  ShieldIcon,
  GlobeIcon,
} from "lucide-react";

export default function About() {
  const { t } = useTranslation();
  const logoImg = new URL("../assets/smokesignal_logo.png", import.meta.url).href;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fire-red to-fire-orange bg-clip-text text-transparent">
            {t("about.title", "About SmokeSignal")}
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {t(
              "about.subtitle",
              "A cutting-edge geospatial fire warning application for South Africa, delivering real-time fire risk intelligence.",
            )}
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-br from-app-dark-lighter to-app-dark rounded-xl p-8 mb-12 shadow-lg border border-app-dark-lightest">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-bold mb-4 text-white">
                {t("about.mission.title", "Our Mission")}
              </h2>
              <p className="text-gray-200 mb-4">
                {t(
                  "about.mission.description1",
                  "SmokeSignal was created with one clear purpose: to protect communities from the devastating impact of wildfires through early detection and timely alerts.",
                )}
              </p>
              <p className="text-gray-200">
                {t(
                  "about.mission.description2",
                  "Using satellite data and advanced algorithms, we provide real-time information about fire hotspots, helping authorities and citizens respond quickly to emerging threats.",
                )}
              </p>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-fire-red to-fire-orange flex items-center justify-center">
                <img
                  src={logoImg}
                  alt="SmokeSignal Logo"
                  className="w-32 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            {t("about.howItWorks.title", "How SmokeSignal Works")}
          </h2>

          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="data">
                {t("about.howItWorks.data.tab", "Data Collection")}
              </TabsTrigger>
              <TabsTrigger value="analysis">
                {t("about.howItWorks.analysis.tab", "Analysis")}
              </TabsTrigger>
              <TabsTrigger value="alerts">
                {t("about.howItWorks.alerts.tab", "Alerts")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="mb-4 md:mb-0 bg-app-dark-lighter p-4 rounded-full">
                      <GlobeIcon size={48} className="text-fire-red" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {t(
                          "about.howItWorks.data.title",
                          "Satellite-Based Fire Detection",
                        )}
                      </h3>
                      <p className="text-gray-300">
                        {t(
                          "about.howItWorks.data.description",
                          "We use NASA's FIRMS (Fire Information for Resource Management System) data, which collects information from multiple satellites scanning Earth's surface. These satellites detect thermal anomalies that indicate active fires with remarkable precision.",
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-gradient-to-r from-blue-950 to-blue-900 border-blue-700">
                <InfoIcon className="h-5 w-5 text-blue-400" />
                <AlertTitle className="text-blue-300">
                  {t("about.howItWorks.data.fact.title", "Did you know?")}
                </AlertTitle>
                <AlertDescription className="text-blue-200">
                  {t(
                    "about.howItWorks.data.fact.description",
                    "VIIRS instruments on satellites can detect fires as small as 375 meters across, providing near real-time data about fire activity around the globe.",
                  )}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="mb-4 md:mb-0 bg-app-dark-lighter p-4 rounded-full">
                      <MapPinIcon size={48} className="text-fire-orange" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {t(
                          "about.howItWorks.analysis.title",
                          "Real-Time Processing",
                        )}
                      </h3>
                      <p className="text-gray-300">
                        {t(
                          "about.howItWorks.analysis.description",
                          "Our algorithms process the raw satellite data in real-time, analyzing fire intensity, proximity to populated areas, and weather conditions. We calculate a Fire Danger Index that helps you understand the threat level in your area.",
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-gradient-to-r from-amber-950 to-amber-900 border-amber-700">
                <InfoIcon className="h-5 w-5 text-amber-400" />
                <AlertTitle className="text-amber-300">
                  {t(
                    "about.howItWorks.analysis.fact.title",
                    "Fire Intelligence",
                  )}
                </AlertTitle>
                <AlertDescription className="text-amber-200">
                  {t(
                    "about.howItWorks.analysis.fact.description",
                    "Our system factors in variables such as wind speed, humidity, and historical fire patterns to provide the most accurate risk assessment possible.",
                  )}
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="mb-4 md:mb-0 bg-app-dark-lighter p-4 rounded-full">
                      <BellIcon size={48} className="text-fire-red" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {t(
                          "about.howItWorks.alerts.title",
                          "Personalized Notifications",
                        )}
                      </h3>
                      <p className="text-gray-300">
                        {t(
                          "about.howItWorks.alerts.description",
                          "Users can subscribe to receive alerts for specific areas of interest. When a fire is detected within your tracked areas, you'll receive instant notifications with critical information and recommended actions.",
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="bg-gradient-to-r from-green-950 to-green-900 border-green-700">
                <ShieldIcon className="h-5 w-5 text-green-400" />
                <AlertTitle className="text-green-300">
                  {t(
                    "about.howItWorks.alerts.fact.title",
                    "Life-Saving Potential",
                  )}
                </AlertTitle>
                <AlertDescription className="text-green-200">
                  {t(
                    "about.howItWorks.alerts.fact.description",
                    "Early warning systems like SmokeSignal can provide critical extra minutes or hours for evacuation, potentially saving lives and property in fire-prone regions.",
                  )}
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>

        {/* Technologies Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            {t("about.technologies.title", "Technologies Behind SmokeSignal")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-app-dark-lighter to-app-dark border border-app-dark-lightest rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">
                {t("about.technologies.frontend.title", "Frontend")}
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-red"></div>
                  <span>React with TypeScript</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-red"></div>
                  <span>Mapbox for geospatial visualization</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-red"></div>
                  <span>Tailwind CSS for responsive design</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-red"></div>
                  <span>i18next for multilingual support</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-app-dark-lighter to-app-dark border border-app-dark-lightest rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">
                {t("about.technologies.backend.title", "Backend & Data")}
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-orange"></div>
                  <span>Node.js with Express</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-orange"></div>
                  <span>NASA FIRMS satellite data integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-orange"></div>
                  <span>Real-time weather data APIs</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fire-orange"></div>
                  <span>PostgreSQL with Drizzle ORM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Future Development */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-8 mb-12 shadow-lg border border-purple-800">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {t("about.future.title", "Future Development")}
          </h2>
          <p className="text-gray-200 mb-6">
            {t(
              "about.future.description",
              "We're constantly working to improve SmokeSignal and expand its capabilities. Here's what's on our roadmap:",
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-800 bg-opacity-30 p-4 rounded-lg border border-purple-700">
              <h3 className="text-xl font-semibold mb-2 text-purple-300">
                {t(
                  "about.future.prediction.title",
                  "AI-Powered Fire Prediction",
                )}
              </h3>
              <p className="text-gray-300">
                {t(
                  "about.future.prediction.description",
                  "Implementing machine learning algorithms to predict fire spread and behavior based on historical data and current conditions.",
                )}
              </p>
            </div>
            <div className="bg-indigo-800 bg-opacity-30 p-4 rounded-lg border border-indigo-700">
              <h3 className="text-xl font-semibold mb-2 text-indigo-300">
                {t("about.future.community.title", "Community Reporting")}
              </h3>
              <p className="text-gray-300">
                {t(
                  "about.future.community.description",
                  "Enabling users to report fires they observe, creating a crowdsourced layer of data to complement satellite observations.",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {t("about.contact.title", "Get in Touch")}
          </h2>
          <p className="text-gray-300 mb-6">
            {t(
              "about.contact.description",
              "Have questions, suggestions, or want to collaborate? We'd love to hear from you.",
            )}
          </p>
          <a
            href="mailto:contact@smokesignal.co.za"
            className="inline-block bg-gradient-to-r from-fire-red to-fire-orange hover:from-fire-orange hover:to-fire-red text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            {t("about.contact.button", "Contact Us")}
          </a>
        </div>
      </div>
    </div>
  );
}
