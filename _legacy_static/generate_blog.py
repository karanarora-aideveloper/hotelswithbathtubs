import os

workspace_dir = '/Users/karanarora/hotelswithbathtubs'
domain = "https://www.hotelswithbathtubs.com"
ga_tag = "G-VE2SJ4WXF8"

blog_dir = os.path.join(workspace_dir, 'blog')
if not os.path.exists(blog_dir):
    os.makedirs(blog_dir)

# Define the 10 Blog Posts
blogs = [
    {
        "slug": "how-a-private-in-room-bathtub-transformed-my-anniversary-date",
        "title": "How a Private In-Room Bathtub Transformed My Anniversary Date",
        "date": "August 14, 2026",
        "author": "Karan Arora",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Planning an anniversary can be stressful. You want it to be perfect, romantic, and memorable. For years, I defaulted to the standard routine: a nice dinner, maybe a movie, and a generic hotel room. But this year, I decided to change things up. I booked a suite with a private, in-room jacuzzi bathtub.</p>
            <h3>The Element of Surprise</h3>
            <p>When my partner and I walked into the suite, the first thing we saw wasn't the bed or the view—it was a massive, deep-soaking bathtub sitting right in the corner of the room, surrounded by floor-to-ceiling windows. The look on her face was priceless. It immediately elevated the entire experience from a standard hotel stay to a luxury retreat.</p>
            <h3>Ultimate Relaxation and Privacy</h3>
            <p>Unlike crowded hotel spas or public pools where you have to worry about other guests, an in-room bathtub offers total seclusion. We spent the evening soaking in warm, bubbling water, sipping champagne, and actually talking without any distractions. There were no phones, no kids running around, and no closing hours to worry about.</p>
            <h3>Why It Changes Everything</h3>
            <p>A private bathtub forces you to slow down. In our fast-paced lives, finding time to simply be present with your partner is rare. The ambiance of dim lighting, warm water, and absolute privacy creates an environment where connection happens naturally. If you are planning a date night, an anniversary, or even a proposal, I cannot recommend booking a room with a private bathtub enough. It is an investment in your relationship that you will not regret.</p>
        """
    },
    {
        "slug": "top-romantic-hotels-with-bathtubs-in-bhopal-for-couples",
        "title": "Top Romantic Hotels with Bathtubs in Bhopal for Couples",
        "date": "August 12, 2026",
        "author": "Travel Editor",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Bhopal, the city of lakes, offers a surprisingly rich array of luxury and heritage hotels perfect for a romantic escape. Whether you are a local couple looking for a weekend staycation or traveling from afar, booking a room with a private bathtub is the best way to experience the city's regal charm.</p>
            <h3>1. The Taj Lakefront Bhopal</h3>
            <p>Perched on the edge of the Upper Lake, the Taj Lakefront is the epitome of luxury. Their premium suites come equipped with deep soaking bathtubs that offer sweeping, panoramic views of the water. Imagine relaxing in a bubble bath while watching the sunset over the lake—it is an unforgettable experience.</p>
            <h3>2. Jehan Numa Palace Hotel</h3>
            <p>If you prefer a heritage vibe, the Jehan Numa Palace offers a royal retreat. Set on the slopes of the Shamla Hills, the hotel features colonial architecture and lush gardens. The luxury suites here feature beautifully designed bathrooms with large bathtubs, combining modern amenities with historic elegance.</p>
            <h3>3. Noor-Us-Sabah Palace</h3>
            <p>Another stunning heritage property, Noor-Us-Sabah Palace offers breathtaking views of the lake. Their royal suites feature expansive bathrooms with luxurious tubs. The serene environment and historical significance of the palace make it a prime spot for couples seeking a quiet, romantic getaway.</p>
            <h3>Booking Advice</h3>
            <p>When booking these hotels, always double-check the room type. Not all rooms in luxury hotels come with bathtubs. Look specifically for "Luxury Suites," "Lake View Suites," or rooms that explicitly mention a spa bath or jacuzzi in the amenities list.</p>
        """
    },
    {
        "slug": "why-goa-is-the-ultimate-destination-for-private-jacuzzi-villas",
        "title": "Why Goa is the Ultimate Destination for Private Jacuzzi Villas",
        "date": "August 10, 2026",
        "author": "Travel Editor",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Goa is synonymous with beaches, nightlife, and tropical vacations. But for couples seeking a romantic and secluded retreat, Goa hides a spectacular secret: it is home to some of the finest private jacuzzi villas in India.</p>
            <h3>The Shift from Crowded Beaches to Private Sanctuaries</h3>
            <p>While the beaches of North Goa can be bustling and vibrant, many couples are now opting for the tranquil experience of South Goa or private, tucked-away villas in the North. Instead of fighting for a sunbed on a crowded beach, you can relax in a private jacuzzi right on your villa's deck, surrounded by palm trees and the sound of the ocean.</p>
            <h3>Types of Jacuzzi Villas in Goa</h3>
            <p><strong>1. Oceanfront Suites:</strong> Several boutique hotels in Ashwem and Morjim offer rooms where the jacuzzi is literally steps away from the sand. You can enjoy the ocean breeze while soaking in absolute privacy.</p>
            <p><strong>2. Jungle Retreats:</strong> If you prefer the lush greenery of Goa's interior, eco-resorts offer wooden chalets with open-air bathtubs. These are incredibly romantic, offering a deep connection with nature.</p>
            <p><strong>3. Luxury Heritage Homes:</strong> Restored Portuguese villas often feature massive, clawfoot bathtubs in their sprawling bathrooms, providing a unique blend of history and luxury.</p>
            <h3>Why Choose Goa?</h3>
            <p>Goa's hospitality infrastructure is unmatched in India. The sheer variety of accommodations means that whether you have a moderate budget or are looking to splurge on a 5-star resort, you can find a room with a private bathtub. Combine that with the world-class seafood, stunning sunsets, and relaxed vibe, and Goa remains the undisputed king of romantic getaways.</p>
        """
    },
    {
        "slug": "mumbai-staycations-best-luxury-hotels-with-deep-soaking-tubs",
        "title": "Mumbai Staycations: Best Luxury Hotels with Deep Soaking Tubs",
        "date": "August 8, 2026",
        "author": "Travel Editor",
        "image": "/assets/fallback.webp",
        "content": """
            <p>In the non-stop hustle of Mumbai, finding a quiet moment can seem impossible. For couples living in the city, escaping the noise and chaos is essential. You don't need to fly out of town to find peace; you just need to book the right staycation. Here is a guide to the best luxury hotels in Mumbai featuring deep soaking tubs.</p>
            <h3>The Taj Mahal Palace, Colaba</h3>
            <p>You cannot talk about luxury in Mumbai without mentioning the Taj. The Heritage Wing suites offer stunning sea views and massive, opulent bathrooms. Soaking in a tub while looking out at the Gateway of India is an experience every Mumbaikar should have at least once.</p>
            <h3>The Oberoi, Nariman Point</h3>
            <p>The Oberoi takes modern luxury to another level. Their Premier Ocean View Rooms feature freestanding bathtubs that are strategically placed next to floor-to-ceiling windows. You can enjoy a bubble bath while watching the sun set over the Queen's Necklace.</p>
            <h3>JW Marriott, Juhu</h3>
            <p>If you prefer a resort vibe without leaving the city, the JW Marriott in Juhu is perfect. Their premium suites feature beautiful marble bathrooms with deep tubs. After a soak, you can step out and enjoy a walk on Juhu beach or dine at one of their fantastic restaurants.</p>
            <h3>The Benefits of a Staycation</h3>
            <p>A staycation eliminates travel stress. You save time, avoid airport hassles, and can maximize your weekend. By choosing a hotel with a premium in-room bathtub, you guarantee a relaxing, spa-like experience right in your home city.</p>
        """
    },
    {
        "slug": "escaping-to-lonavala-private-bathtubs-with-mountain-views",
        "title": "Escaping to Lonavala: Private Bathtubs with Mountain Views",
        "date": "August 5, 2026",
        "author": "Travel Editor",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Lonavala is the quintessential weekend getaway for residents of Mumbai and Pune. While it is famous for its monsoons and chikki, it is also home to some incredibly romantic resorts that offer the ultimate luxury: private bathtubs with panoramic mountain views.</p>
            <h3>The Magic of the Sahyadris</h3>
            <p>There is nothing quite like the Sahyadri mountains during the monsoon or winter. The mist, the lush green valleys, and the cool breeze create a magical setting. Now, imagine experiencing all of that from the warmth of a private jacuzzi.</p>
            <h3>Top Picks for Bathtub Views</h3>
            <p><strong>1. Machan Resorts:</strong> Famous for their treehouses, The Machan offers eco-friendly luxury. Several of their premium treehouses feature stunning open-air bathtubs built right into the wooden decks, overlooking the dense forest canopy.</p>
            <p><strong>2. Hilton Shillim Estate Retreat & Spa:</strong> Located slightly away from the main Lonavala strip, this wellness retreat is a sanctuary of peace. Their spa villas feature large, deep-soaking tubs that look out onto private gardens or the surrounding valleys.</p>
            <p><strong>3. Aamby Valley City:</strong> For a more curated luxury experience, Aamby Valley's chalets and villas offer premium amenities, including massive indoor jacuzzis that are perfect for a romantic evening.</p>
            <h3>Why It Matters</h3>
            <p>When you are in the mountains, the view is everything. A room with a bathtub that faces a blank wall is a missed opportunity. Always request a valley-view or mountain-view room when booking your Lonavala bathtub retreat to ensure the most romantic experience possible.</p>
        """
    },
    {
        "slug": "a-couples-guide-to-udaipur-royal-heritage-hotels-with-bath-suites",
        "title": "A Couple's Guide to Udaipur: Royal Heritage Hotels with Bath Suites",
        "date": "August 1, 2026",
        "author": "Travel Editor",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Udaipur is often called the Venice of the East, and for good reason. Its stunning lakes, majestic palaces, and romantic atmosphere make it the premier destination for couples in India. To truly experience Udaipur's royal heritage, booking a bath suite in a heritage hotel is a must.</p>
            <h3>The Taj Lake Palace</h3>
            <p>Floating in the middle of Lake Pichola, the Taj Lake Palace is iconic. The suites here are designed to make you feel like royalty. The bathrooms are masterpieces of marble and intricate tile work, featuring deep tubs where you can soak while gazing out at the City Palace across the water.</p>
            <h3>The Oberoi Udaivilas</h3>
            <p>Spread across 30 acres of manicured gardens, Udaivilas offers an unparalleled luxury experience. Their Premier Rooms with Semi-Private Pools also feature stunning Victorian-style freestanding bathtubs. The attention to detail, from the rose petals to the luxury bath salts, ensures a perfectly romantic evening.</p>
            <h3>Leela Palace Udaipur</h3>
            <p>Every room at the Leela Palace offers a view of Lake Pichola. Their luxury suites feature expansive marble bathrooms with massive soaking tubs. The ESPA bath amenities provided add a spa-like quality to your in-room soak.</p>
            <h3>Living Like Royalty</h3>
            <p>In Udaipur, a bathtub isn't just a utility; it's part of the royal fantasy. The heritage hotels go out of their way to provide luxurious touches like aromatic bath oils, floating candles, and even a glass of wine to enjoy during your soak. It is the ultimate romantic indulgence.</p>
        """
    },
    {
        "slug": "the-psychology-of-relaxation-why-couples-need-a-spa-bath-retreat",
        "title": "The Psychology of Relaxation: Why Couples Need a Spa Bath Retreat",
        "date": "July 28, 2026",
        "author": "Wellness Expert",
        "image": "/assets/fallback.webp",
        "content": """
            <p>In today's hyper-connected world, couples are finding it increasingly difficult to disconnect from work and connect with each other. This is why booking a spa bath retreat—specifically a hotel room with a private jacuzzi or deep soaking tub—is more than just a luxury; it is a psychological necessity.</p>
            <h3>The Science of Warm Water</h3>
            <p>Hydrotherapy has been used for centuries to promote relaxation. Warm water causes blood vessels to dilate, which improves circulation and sends a signal to the brain to relax. This physical relaxation triggers a psychological release of tension. When couples experience this together, it lowers defenses and fosters open, intimate communication.</p>
            <h3>Creating a Tech-Free Zone</h3>
            <p>A bathtub is one of the few places left where bringing a smartphone is inherently dangerous. This forced digital detox is incredibly beneficial for relationships. Without the distraction of notifications or social media feeds, couples are forced to be present with one another.</p>
            <h3>The Intimacy of Shared Silence</h3>
            <p>You don't always have to be talking to be connecting. Sharing a quiet soak in a private jacuzzi allows couples to enjoy comfortable silence. The rhythmic sound of bubbles or running water acts as white noise, calming the nervous system and promoting a deep sense of shared peace.</p>
            <p>Prioritizing a weekend getaway with a private bathtub is a powerful way to reset your relationship, lower your stress levels, and reconnect on a meaningful level.</p>
        """
    },
    {
        "slug": "delhi-weekend-getaways-exploring-the-best-in-room-bathtubs",
        "title": "Delhi Weekend Getaways: Exploring the Best In-Room Bathtubs",
        "date": "July 20, 2026",
        "author": "Travel Editor",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Delhi's extreme weather and fast-paced lifestyle can leave anyone exhausted. For couples looking to escape the city's smog and noise, a weekend getaway to a luxury hotel with an in-room bathtub is the perfect antidote.</p>
            <h3>The Roseate, New Delhi</h3>
            <p>Located near the airport, The Roseate feels like a world away from Delhi. It is an architectural marvel surrounded by lush greenery and water bodies. Their premium rooms feature stunning sunken bathtubs that blend seamlessly with the modern, minimalist design of the resort. It is a tranquil oasis within the city limits.</p>
            <h3>The Leela Palace, Chanakyapuri</h3>
            <p>If you prefer classic, opulent luxury, The Leela Palace is unmatched. Their Grand Premier Rooms feature massive marble bathrooms with deep soaking tubs. The hotel provides premium Kama Ayurveda bath products, ensuring a truly royal soaking experience.</p>
            <h3>ITC Grand Bharat, Gurugram</h3>
            <p>Just a short drive from Delhi, this sprawling resort offers a majestic retreat. The luxury suites feature grand bathrooms with intricate detailing and large bathtubs. The resort's quiet environment and massive golf course make it a perfect weekend escape.</p>
            <h3>Why In-Room Baths Matter in Delhi</h3>
            <p>After a day of navigating Delhi's traffic or enduring the summer heat, retreating to an air-conditioned room and sinking into a warm bath is the ultimate relief. It transforms a simple hotel stay into a rejuvenating wellness experience.</p>
        """
    },
    {
        "slug": "bangalores-hidden-gems-boutique-hotels-with-private-jacuzzis",
        "title": "Bangalore's Hidden Gems: Boutique Hotels with Private Jacuzzis",
        "date": "July 15, 2026",
        "author": "Travel Editor",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Bangalore's tech-driven culture means its residents work hard and need a place to unwind even harder. While the city has plenty of large 5-star hotels, the real charm lies in its boutique properties that offer intimate, romantic experiences, complete with private jacuzzis.</p>
            <h3>The Windflower Prakruthi</h3>
            <p>Located on the outskirts of the city, this resort is a lush, green sanctuary. Their private villas come with outdoor, open-sky jacuzzis. Soaking in warm water while surrounded by nature and the cool Bangalore breeze is an unforgettable experience.</p>
            <h3>Angsana Oasis Spa & Resort</h3>
            <p>This resort seamlessly blends nature with luxury. Their premium suites feature beautiful in-room bathtubs. As a dedicated spa resort, the focus here is entirely on wellness and relaxation, making it the perfect destination for a romantic couple's retreat.</p>
            <h3>Guhantara Resort</h3>
            <p>For something truly unique, Guhantara is India's first underground cave resort. While it sounds rugged, their luxury cave suites are fully equipped with modern amenities, including private bathtubs. It is a quirky, romantic, and highly private experience.</p>
            <h3>The Boutique Advantage</h3>
            <p>Boutique hotels offer a level of privacy and personalized service that massive chains often cannot match. When you book a jacuzzi suite at a boutique property in Bangalore, you are guaranteed a quiet, intimate environment perfectly suited for a romantic staycation.</p>
        """
    },
    {
        "slug": "how-to-plan-the-perfect-anniversary-surprise-in-a-jacuzzi-suite",
        "title": "How to Plan the Perfect Anniversary Surprise in a Jacuzzi Suite",
        "date": "July 10, 2026",
        "author": "Romance Concierge",
        "image": "/assets/fallback.webp",
        "content": """
            <p>Booking a hotel room with a private jacuzzi is a great start for an anniversary, but to make it truly unforgettable, you need to plan the details. Here is a step-by-step guide to executing the perfect romantic surprise in a jacuzzi suite.</p>
            <h3>1. Coordinate with the Hotel Concierge</h3>
            <p>Don't do everything yourself! Call the hotel a few days in advance. Most luxury hotels have a dedicated romance concierge who can help arrange rose petals, candles, and champagne in the room before you arrive.</p>
            <h3>2. Set the Ambiance</h3>
            <p>Lighting is crucial. Turn off the harsh overhead lights and rely on lamps and LED candles (real candles are often not allowed in hotels due to fire hazards). Bring a portable Bluetooth speaker to play a curated playlist of your partner's favorite romantic songs.</p>
            <h3>3. The Perfect Bath Recipe</h3>
            <p>A jacuzzi is great, but adding the right elements makes it a spa experience. Bring high-quality bath bombs, essential oils (lavender or sandalwood are great for relaxation), and bath salts. Be sure to check with the hotel if bath bombs are allowed in their jetted tubs.</p>
            <h3>4. Champagne and Strawberries</h3>
            <p>It sounds cliché because it works. Have a bottle of chilled champagne or their favorite wine ready on a tray next to the tub, along with some chocolate-covered strawberries or their favorite dessert.</p>
            <h3>5. Disconnect</h3>
            <p>The most important step: put your phones on 'Do Not Disturb' and leave them in the bedroom. The jacuzzi is for connecting with each other, not scrolling through social media. Focus entirely on your partner and enjoy the romantic retreat you have created.</p>
        """
    }
]


header_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Hotels with Bathtubs Blog</title>
    <meta name="description" content="Read our latest article: {title}">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛁</text></svg>">
    <meta property="og:title" content="{title}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{url}">
    <link rel="canonical" href="{url}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">
    
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-VE2SJ4WXF8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-VE2SJ4WXF8');
    </script>
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "{title}",
      "author": {
        "@type": "Person",
        "name": "Hotels With Bathtubs Editor"
      },
      "datePublished": "{date}"
    }
    </script>
</head>
<body>
    <nav class="navbar">
        <a href="/">
            <h1>Hotels With Bathtubs</h1>
            <p>Discover romantic hotels with private bathtubs</p>
        </a>
        <div class="nav-links">
            <a href="/blog/">Blog</a>
        </div>
    </nav>
"""

footer_html = """
    <footer style="margin-top: 4rem; padding: 3rem; background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
        <div style="max-width: 800px; margin: 0 auto;">
            <p style="color: var(--text-muted); margin-bottom: 1rem;">&copy; 2026 HotelsWithBathtubs.com. All rights reserved.</p>
            <div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
                <a href="/about" style="color: var(--accent); font-size: 0.9rem;">About Us</a>
                <a href="/contact" style="color: var(--accent); font-size: 0.9rem;">Contact</a>
                <a href="/privacy-policy-2" style="color: var(--accent); font-size: 0.9rem;">Privacy Policy</a>
                <a href="/legal-notice" style="color: var(--accent); font-size: 0.9rem;">Terms of Service</a>
                <a href="/cookie-policy" style="color: var(--accent); font-size: 0.9rem;">Cookie Policy</a>
            </div>
        </div>
    </footer>
</body>
</html>
"""

# 1. Generate Individual Blog Pages
print("Generating individual blog pages...")
for blog in blogs:
    article_dir = os.path.join(blog_dir, blog['slug'])
    if not os.path.exists(article_dir):
        os.makedirs(article_dir)
        
    url = f"{domain}/blog/{blog['slug']}/"
    head = header_html.replace("{title}", blog['title']).replace("{url}", url).replace("{date}", blog['date'])
    
    body = f"""
    <main class="container blog-article">
        <header class="blog-header">
            <div class="blog-meta">Published on {blog['date']} by {blog['author']}</div>
            <h1>{blog['title']}</h1>
        </header>
        <div class="blog-content">
            {blog['content']}
        </div>
        <div class="blog-footer">
            <a href="/blog/" class="back-link">← Back to all articles</a>
        </div>
    </main>
    """
    
    with open(os.path.join(article_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(head + body + footer_html)

# 2. Generate Blog Hub (index.html)
print("Generating blog hub page...")
hub_url = f"{domain}/blog/"
hub_head = header_html.replace("{title}", "Romantic Getaways Blog").replace("{url}", hub_url).replace("{date}", "2026")

cards = ""
for blog in blogs:
    cards += f"""
        <a href="/blog/{blog['slug']}/" class="card">
            <div class="card-content" style="padding: 2rem;">
                <span class="blog-meta" style="font-size: 0.9rem; color: var(--accent); display: block; margin-bottom: 0.5rem;">{blog['date']}</span>
                <span class="card-title" style="font-size: 1.3rem;">{blog['title']}</span>
            </div>
        </a>
    """

hub_body = f"""
    <section class="hero" style="padding: 4rem 1rem;">
        <h2>Travel & Romance Blog</h2>
        <p>Expert guides, destination reviews, and inspiration for your next romantic getaway.</p>
    </section>
    <main class="container">
        <div class="grid">
            {cards}
        </div>
    </main>
"""

with open(os.path.join(blog_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(hub_head + hub_body + footer_html)

print("Blog generation complete!")
