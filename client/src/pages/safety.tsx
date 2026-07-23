import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FlameIcon, 
  ShieldIcon, 
  PhoneIcon,
  HomeIcon, 
  BellIcon, 
  DropletIcon,
  PackageIcon,
  CarIcon,
  HeartIcon,
  MapIcon,
  UsersIcon,
  SirenIcon,
  CloudRainIcon
} from "lucide-react";

export default function Safety() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fire-red to-fire-orange bg-clip-text text-transparent">
            {t("safety.pageTitle", "Fire Safety Guide")}
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {t(
              "safety.pageSubtitle",
              "Essential knowledge and preparedness strategies for wildfire safety"
            )}
          </p>
        </div>

        {/* Safety Categories */}
        <Tabs defaultValue="before" className="w-full mb-12">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="before">
              {t("safety.tabs.before", "Before a Fire")}
            </TabsTrigger>
            <TabsTrigger value="during">
              {t("safety.tabs.during", "During a Fire")}
            </TabsTrigger>
            <TabsTrigger value="after">
              {t("safety.tabs.after", "After a Fire")}
            </TabsTrigger>
          </TabsList>
          
          {/* Before a Fire */}
          <TabsContent value="before" className="space-y-6">
            <Alert className="bg-gradient-to-r from-blue-950 to-blue-900 border-blue-700 mb-6">
              <ShieldIcon className="h-5 w-5 text-blue-400" />
              <AlertTitle className="text-blue-300">
                {t("safety.before.alert.title", "Preparation saves lives")}
              </AlertTitle>
              <AlertDescription className="text-blue-200">
                {t(
                  "safety.before.alert.description",
                  "Taking proactive steps before wildfire season can dramatically increase your chances of protecting your home and family."
                )}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <HomeIcon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.before.home.title", "Prepare Your Home")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.before.home.item1", "Create a defensible space by clearing vegetation 30 meters around your home")}</li>
                        <li>{t("safety.before.home.item2", "Remove flammable materials from roof and gutters")}</li>
                        <li>{t("safety.before.home.item3", "Install mesh screens on vents to prevent embers from entering")}</li>
                        <li>{t("safety.before.home.item4", "Use fire-resistant materials for repairs or renovations")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <PackageIcon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.before.kit.title", "Prepare an Emergency Kit")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.before.kit.item1", "N95 masks to protect from smoke inhalation")}</li>
                        <li>{t("safety.before.kit.item2", "Three-day supply of non-perishable food and water")}</li>
                        <li>{t("safety.before.kit.item3", "First aid supplies, prescription medications")}</li>
                        <li>{t("safety.before.kit.item4", "Battery-powered radio to receive updates if power fails")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <UsersIcon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.before.plan.title", "Create a Family Emergency Plan")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.before.plan.item1", "Identify multiple evacuation routes from your home and community")}</li>
                        <li>{t("safety.before.plan.item2", "Designate a meeting point outside the hazard area")}</li>
                        <li>{t("safety.before.plan.item3", "Create a family communication plan if separated")}</li>
                        <li>{t("safety.before.plan.item4", "Practice evacuation drills regularly with all family members")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <BellIcon className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.before.informed.title", "Stay Informed")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.before.informed.item1", "Sign up for SmokeSignal alerts for your area")}</li>
                        <li>{t("safety.before.informed.item2", "Follow local emergency management social media channels")}</li>
                        <li>{t("safety.before.informed.item3", "Know the emergency alert system used in your community")}</li>
                        <li>{t("safety.before.informed.item4", "Understand fire danger ratings and what they mean for your actions")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* During a Fire */}
          <TabsContent value="during" className="space-y-6">
            <Alert className="bg-gradient-to-r from-red-950 to-orange-900 border-red-700 mb-6">
              <FlameIcon className="h-5 w-5 text-red-400" />
              <AlertTitle className="text-red-300">
                {t("safety.during.alert.title", "Time is critical")}
              </AlertTitle>
              <AlertDescription className="text-red-200">
                {t(
                  "safety.during.alert.description",
                  "During an active wildfire, quick decision-making and following evacuation orders promptly can save lives."
                )}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <CarIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.during.evacuate.title", "Evacuate Early")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.during.evacuate.item1", "If authorities issue an evacuation order, leave immediately")}</li>
                        <li>{t("safety.during.evacuate.item2", "Don't wait until you can see flames to evacuate")}</li>
                        <li>{t("safety.during.evacuate.item3", "Use your pre-planned evacuation routes")}</li>
                        <li>{t("safety.during.evacuate.item4", "Bring your emergency kit and essential documents")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <PhoneIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.during.emergency.title", "Emergency Contacts")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.during.emergency.item1", "South African Emergency Services: 10177")}</li>
                        <li>{t("safety.during.emergency.item2", "Fire and Rescue Services: 021 480 7700")}</li>
                        <li>{t("safety.during.emergency.item3", "Emergency from mobile: 112")}</li>
                        <li>{t("safety.during.emergency.item4", "Western Cape Disaster Management: 021 937 0800")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <HomeIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.during.trapped.title", "If You're Trapped")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.during.trapped.item1", "Stay inside your home - it offers better protection than outside")}</li>
                        <li>{t("safety.during.trapped.item2", "Close all doors and windows, but don't lock them")}</li>
                        <li>{t("safety.during.trapped.item3", "Fill sinks and tubs with water for emergency use")}</li>
                        <li>{t("safety.during.trapped.item4", "Stay away from outside walls and windows")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <MapIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.during.driving.title", "If Driving in Fire Area")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.during.driving.item1", "Turn on headlights and close all windows")}</li>
                        <li>{t("safety.during.driving.item2", "Drive slowly as smoke reduces visibility")}</li>
                        <li>{t("safety.during.driving.item3", "Watch for emergency vehicles and evacuees on foot")}</li>
                        <li>{t("safety.during.driving.item4", "If you cannot see due to smoke, pull over to a clear area, turn on hazard lights")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* After a Fire */}
          <TabsContent value="after" className="space-y-6">
            <Alert className="bg-gradient-to-r from-green-950 to-teal-900 border-green-700 mb-6">
              <HeartIcon className="h-5 w-5 text-green-400" />
              <AlertTitle className="text-green-300">
                {t("safety.after.alert.title", "Recovery phase")}
              </AlertTitle>
              <AlertDescription className="text-green-200">
                {t(
                  "safety.after.alert.description",
                  "After a wildfire, careful assessment and proper safety precautions are essential before returning to affected areas."
                )}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <SirenIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.after.return.title", "Returning Home")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.after.return.item1", "Wait until authorities declare it is safe to return")}</li>
                        <li>{t("safety.after.return.item2", "Be aware of hazards like hot spots, falling trees and power lines")}</li>
                        <li>{t("safety.after.return.item3", "Inspect your home carefully before entering")}</li>
                        <li>{t("safety.after.return.item4", "Document damage with photos for insurance claims")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <DropletIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.after.water.title", "Water and Food Safety")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.after.water.item1", "Assume water is not safe to drink until tested")}</li>
                        <li>{t("safety.after.water.item2", "Discard any food exposed to heat, smoke, or soot")}</li>
                        <li>{t("safety.after.water.item3", "Check refrigerated food if power was out")}</li>
                        <li>{t("safety.after.water.item4", "Use bottled water for drinking and cooking until water supply is declared safe")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <CloudRainIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.after.landslides.title", "Beware of Landslides")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.after.landslides.item1", "Burned areas are vulnerable to landslides during rain")}</li>
                        <li>{t("safety.after.landslides.item2", "Watch for signs like tilting trees or sudden increases in stream flow")}</li>
                        <li>{t("safety.after.landslides.item3", "Have an evacuation plan ready if you live in a landslide-prone area")}</li>
                        <li>{t("safety.after.landslides.item4", "Consider temporary relocation during heavy rainfall periods")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-app-dark border-app-dark-lightest">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-app-dark-lighter p-3 rounded-full">
                      <HeartIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {t("safety.after.mental.title", "Mental Health")}
                      </h3>
                      <ul className="space-y-2 text-gray-300 list-disc pl-5">
                        <li>{t("safety.after.mental.item1", "Acknowledge that emotional reactions to disasters are normal")}</li>
                        <li>{t("safety.after.mental.item2", "Take care of your physical health to support mental wellbeing")}</li>
                        <li>{t("safety.after.mental.item3", "Connect with community support groups and services")}</li>
                        <li>{t("safety.after.mental.item4", "Seek professional help if stress, anxiety or depression persist")}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Resources Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            {t("safety.resources.title", "Community Resources")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-app-dark-lighter to-app-dark rounded-lg p-6 border border-app-dark-lightest shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-fire-red" />
                {t("safety.resources.emergency.title", "Emergency Contacts")}
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex justify-between">
                  <span>Emergency Services</span>
                  <span className="font-mono">10177</span>
                </li>
                <li className="flex justify-between">
                  <span>All Emergencies</span>
                  <span className="font-mono">112</span>
                </li>
                <li className="flex justify-between">
                  <span>Working on Fire</span>
                  <span className="font-mono">021 418 2569</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-app-dark-lighter to-app-dark rounded-lg p-6 border border-app-dark-lightest shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-fire-orange" />
                {t("safety.resources.volunteer.title", "Volunteer & Donate")}
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Volunteer Wildfire Services</li>
                <li>• South African Red Cross</li>
                <li>• Local Community Fire Watch</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-app-dark-lighter to-app-dark rounded-lg p-6 border border-app-dark-lightest shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-fire-red" />
                {t("safety.resources.education.title", "Education & Training")}
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• FireWise Communities Program</li>
                <li>• Cape Nature Conservation</li>
                <li>• Fire Protection Associations</li>
                <li>• Local Fire Department Workshops</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-app-dark-lighter to-app-dark rounded-xl p-8 text-center border border-app-dark-lightest shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">
            {t("safety.cta.title", "Stay Informed with SmokeSignal")}
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            {t(
              "safety.cta.description",
              "SmokeSignal provides real-time fire alerts and safety information to help you stay prepared and protected during wildfire season."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/" 
              className="inline-block bg-gradient-to-r from-fire-red to-fire-orange hover:from-fire-orange hover:to-fire-red text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              {t("safety.cta.mapButton", "View Fire Map")}
            </a>
            <a 
              href="/about" 
              className="inline-block bg-transparent border-2 border-fire-orange text-white font-bold py-3 px-6 rounded-full hover:bg-fire-orange hover:bg-opacity-20 transition-all duration-300"
            >
              {t("safety.cta.learnButton", "Learn More")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}