export type Review = {
  name: string
  rating: number
  text: string
  treatment: string
}

export const reviews: Review[] = [
  { name: 'Sarah M.', rating: 5, text: "I was so nervous about lip filler but Bernadette put me completely at ease from the moment I walked in. She took her time to understand exactly what I wanted — subtle and natural — and that's precisely what I got. Two weeks on and my lips look absolutely beautiful. I couldn't be happier.", treatment: 'Lip Filler' },
  { name: 'Claire T.', rating: 5, text: "I've been having Botox with Bernadette for two years now and I wouldn't go anywhere else. She's incredibly skilled and takes a conservative approach that means I always look like myself — just refreshed. My colleagues never know I've had anything done, which is exactly what I wanted.", treatment: 'Anti-Wrinkle' },
  { name: 'Joanne R.', rating: 5, text: "Had Profhilo for the first time after Bernadette recommended it during my consultation. The difference in my skin after just two sessions was remarkable — it looks so much more hydrated and plump. Bernadette is knowledgeable, caring and completely trustworthy. Highly recommend.", treatment: 'Profhilo' },
  { name: 'Amanda K.', rating: 5, text: "I had AQUALYX for my double chin and the results have been incredible. Bernadette explained everything so thoroughly and made me feel completely comfortable throughout. After three sessions the difference is remarkable. She's an absolute professional and I wouldn't hesitate to recommend her.", treatment: 'AQUALYX' },
  { name: 'Rachel B.', rating: 5, text: "Bernadette treated my hyperhidrosis and it has genuinely changed my life. I can wear whatever I want now without worrying. Her medical background gives you such confidence that you're in safe hands. The consultation was thorough and she answered every question I had. Outstanding.", treatment: 'Hyperhidrosis' },
  { name: 'Michelle D.', rating: 5, text: "Had micro-needling for some old acne scarring and I'm so pleased with the results. Bernadette was brilliant at explaining the process and managing my expectations. After three sessions my skin looks smoother than it has in years. Her aftercare advice was second to none too.", treatment: 'Micro-Needling' },
]
