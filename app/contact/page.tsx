import LostReportForm from '@/components/LostReportForm'

const contacts = [
  { name: 'ანი ჩხეტიანი',            email: 'a.chkhetiani@millennium-school.org'     },
  { name: 'ალექსანდრე ქორთუა',       email: 'a.kortua@millennium-school.org'         },
  { name: 'ანასტასია მარკოზაშვილი',  email: 'an.markozashvili@millennium-school.org' },
  { name: 'ლიზი შელია',              email: 'l.shelia@millennium-school.org'         },
]

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-12">

        {/* Contacts */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 font-serif">კონტაქტი</h1>
            <p className="text-sm text-gray-400 font-sans">ნივთის დაბრუნებასთან დაკავშირებით:</p>
          </div>
          <div className="space-y-3">
            {contacts.map(({ name, email }) => (
              <div key={email} className="card p-5 flex items-center justify-between">
                <span className="font-medium text-gray-900 font-serif">{name}</span>
                <span className="text-sm text-gray-400 font-sans">{email}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div>
          <LostReportForm />
        </div>

      </div>
    </div>
  )
}
